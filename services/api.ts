import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    deleteDoc,
    updateDoc,
    query,
    where,
    orderBy,
    Timestamp
} from 'firebase/firestore';
import { db, auth as firebaseAuth } from './firebase';
import axios from 'axios';

const WEBHOOK_URL = import.meta.env.VITE_LOGIN_WEBHOOK_URL;

export const auth = {
    login: async (email: string, cpf: string) => {
        // 1. Call webhook for validation
        const response = await axios.post(WEBHOOK_URL, {
            email: email.trim(),
            cpf: cpf.replace(/\D/g, '')
        });

        const data = response.data;
        if (Array.isArray(data) && data.length > 0) {
            const firstItem = data[0];
            if (firstItem.success === 'success') {
                // Auth successful on Webhook

                // Authorize in Firebase anonymously to satisfy Security Rules
                const { signInAnonymously } = await import("firebase/auth");
                await signInAnonymously(firebaseAuth);

                // Find or create user in Firestore
                const usersRef = collection(db, 'users');
                const q = query(usersRef, where('email', '==', email));
                const querySnapshot = await getDocs(q);

                let userData;
                if (querySnapshot.empty) {
                    const newUser = await addDoc(usersRef, {
                        email,
                        cpf,
                        name: 'Member',
                        isAdmin: false,
                        createdAt: Timestamp.now()
                    });
                    userData = { id: newUser.id, email, name: 'Member', isAdmin: false };
                } else {
                    const userDoc = querySnapshot.docs[0];
                    userData = { id: userDoc.id, ...userDoc.data() };
                }

                localStorage.setItem('user', JSON.stringify(userData));
                localStorage.setItem('token', 'firebase-session-active');
                return { data: userData };
            } else {
                throw new Error('Permissão negada (Webhook)');
            }
        } else {
            throw new Error('Resposta inválida do servidor de autenticação');
        }
    },

    adminLogin: async (email: string, password: string) => {
        // For admin login, we can use simple env check or a dedicated Firestore collection
        const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
        const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;

        if (email === adminEmail && password === adminPassword) {
            // Authorize in Firebase anonymously for Admins too
            const { signInAnonymously } = await import("firebase/auth");
            await signInAnonymously(firebaseAuth);

            const adminData = { id: 'admin', email, name: 'Administrador', isAdmin: true };
            localStorage.setItem('user', JSON.stringify(adminData));
            localStorage.setItem('token', 'admin-session-active');
            return { data: adminData };
        } else {
            throw new Error('Credenciais de admin inválidas');
        }
    },

    me: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    logout: () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    }
};

export const workouts = {
    create: async (data: any) => {
        const currentUser = auth.me();
        if (!currentUser) throw new Error('Not authenticated');

        const docRef = await addDoc(collection(db, 'workouts'), {
            ...data,
            userId: currentUser.id,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        });
        return { data: { id: docRef.id, ...data } };
    },

    getAll: async () => {
        const currentUser = auth.me();
        if (!currentUser) throw new Error('Not authenticated');

        const q = query(
            collection(db, 'workouts'),
            where('userId', '==', currentUser.id),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        return { data: querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) };
    },

    getOne: async (id: string) => {
        const currentUser = auth.me();
        if (!currentUser) throw new Error('Not authenticated');

        const docRef = doc(db, 'workouts', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            // Client-side RLS simulation
            if (data.userId !== currentUser.id && !currentUser.isAdmin) {
                throw new Error('Unauthorized access');
            }
            return { data: { id: docSnap.id, ...data } };
        } else {
            throw new Error('Workout not found');
        }
    },

    delete: async (id: string) => {
        const currentUser = auth.me();
        if (!currentUser) throw new Error('Not authenticated');

        const docRef = doc(db, 'workouts', id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) throw new Error('Workout not found');

        const data = docSnap.data();
        if (data.userId !== currentUser.id && !currentUser.isAdmin) {
            throw new Error('Unauthorized delete');
        }

        return deleteDoc(docRef);
    },

    update: async (id: string, data: any) => {
        const currentUser = auth.me();
        if (!currentUser) throw new Error('Not authenticated');

        const docRef = doc(db, 'workouts', id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) throw new Error('Workout not found');

        const existingData = docSnap.data();
        if (existingData.userId !== currentUser.id && !currentUser.isAdmin) {
            throw new Error('Unauthorized update');
        }

        return updateDoc(docRef, {
            ...data,
            updatedAt: Timestamp.now()
        });
    },
};

export const support = {
    logMessage: async (data: {
        userId: string,
        role: 'user' | 'coach',
        message: string,
        sessionId: string,
        workoutContextId?: string
    }) => {
        try {
            await addDoc(collection(db, 'support_chats'), {
                ...data,
                timestamp: Timestamp.now()
            });
        } catch (error) {
            console.error("Failed to log support message:", error);
            // Non-blocking error - chat should continue even if logging fails
        }
    }
};

export const exercises = {
    getAll: async () => {
        const q = query(collection(db, 'exercises'), orderBy('nome', 'asc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    add: (data: any) => addDoc(collection(db, 'exercises'), {
        ...data,
        createdAt: Timestamp.now()
    }),

    update: (id: string, data: any) => updateDoc(doc(db, 'exercises', id), data),

    delete: (id: string) => deleteDoc(doc(db, 'exercises', id))
};


export const ai = {};

export const users = {
    checkGenerationLimit: async (userId: string): Promise<{ allowed: boolean; message?: string }> => {
        // Admins are always allowed
        if (userId === 'admin') return { allowed: true };

        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            return { allowed: false, message: 'Usuário não encontrado.' };
        }

        const userData = userSnap.data();
        if (userData.isAdmin) return { allowed: true };

        const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
        const lastMonth = userData.usage?.lastGenerationMonth;
        const count = userData.usage?.generationCount || 0;

        // If it's a new month, allow (counter will be reset on record)
        if (lastMonth !== currentMonth) {
            return { allowed: true };
        }

        // Check limit
        if (count >= 10) {
            return { allowed: false, message: 'Você atingiu o limite de 10 treinos gerados neste mês.' };
        }

        return { allowed: true };
    },

    recordWorkoutGeneration: async (userId: string) => {
        if (userId === 'admin') return;

        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) return;

        const userData = userSnap.data();
        const currentMonth = new Date().toISOString().slice(0, 7);
        const lastMonth = userData.usage?.lastGenerationMonth;
        let newCount = userData.usage?.generationCount || 0;

        if (lastMonth !== currentMonth) {
            newCount = 1; // First of the month
        } else {
            newCount++;
        }

        await updateDoc(userRef, {
            usage: {
                lastGenerationMonth: currentMonth,
                generationCount: newCount
            }
        });
    }
};

// Start of workouts extension for edit limits
export const workoutLimits = { // Separated to avoid conflict with existing workouts object if not merging carefully
    checkEditLimit: async (workoutId: string, userId: string): Promise<{ allowed: boolean; message?: string }> => {
        if (userId === 'admin') return { allowed: true };

        // We need to fetch the user to check if they are an admin stored in DB
        // But for optimization, we assume the calling code knows if it's the 'admin' local user.
        // Let's also check if the DB user is admin.
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists() && userSnap.data().isAdmin) return { allowed: true };

        const workoutRef = doc(db, 'workouts', workoutId);
        const workoutSnap = await getDoc(workoutRef);

        if (!workoutSnap.exists()) return { allowed: false, message: 'Treino não encontrado.' };

        const data = workoutSnap.data();
        if (data.editCount && data.editCount >= 1) {
            return { allowed: false, message: 'Você já editou este treino uma vez. O limite é de 1 edição por treino.' };
        }

        return { allowed: true };
    },

    recordEdit: async (workoutId: string) => {
        const workoutRef = doc(db, 'workouts', workoutId);
        const workoutSnap = await getDoc(workoutRef);

        if (!workoutSnap.exists()) return;

        const currentCount = workoutSnap.data().editCount || 0;

        await updateDoc(workoutRef, {
            editCount: currentCount + 1
        });
    }
};

