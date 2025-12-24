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
                // Auth successful
                // We'll use a local session for now since we're using a webhook for validation
                // In a real app, you might want Firebase Custom Auth or just store data in Firestore

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
                localStorage.setItem('token', 'firebase-session-active'); // Placeholder for compatibility
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

export const ai = {
    // We'll still need an endpoint for AI generation if it's complex, 
    // or we can call Gemini SDK directly from frontend if the keys are there.
};
