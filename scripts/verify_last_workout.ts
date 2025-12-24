
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

// Initialize Firebase Admin
const serviceAccountPath = path.resolve('../biolift-trainer-ai-12345-firebase-adminsdk-fbsvc-794d9fea3e.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function verifyLastWorkout() {
    console.log('--- FETCHING LAST WORKOUT ---');

    const workoutsRef = db.collection('workouts');
    const snapshot = await workoutsRef.orderBy('createdAt', 'desc').limit(1).get();

    if (snapshot.empty) {
        console.log('No workouts found.');
        return;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    console.log(`ID: ${doc.id}`);
    console.log(`Title: ${data.title}`);
    console.log('--- CONTENT START ---');
    console.log(data.content);
    console.log('--- CONTENT END ---');
}

verifyLastWorkout().catch(console.error);
