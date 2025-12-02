import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

const testApi = async () => {
    try {
        console.log('--- Testing Backend API ---');

        // 1. Register
        console.log('1. Registering user...');
        const email = `test${Date.now()}@example.com`;
        const password = 'password123';

        try {
            await axios.post(`${API_URL}/auth/register`, {
                email,
                password,
                name: 'Test User'
            });
            console.log('✅ Register success');
        } catch (e: any) {
            console.error('❌ Register failed:', e.response?.data || e.message);
            return;
        }

        // 2. Login
        console.log('2. Logging in...');
        let token = '';
        try {
            const loginRes = await axios.post(`${API_URL}/auth/login`, {
                email,
                password
            });
            token = loginRes.data.token;
            console.log('✅ Login success');
        } catch (e: any) {
            console.error('❌ Login failed:', e.response?.data || e.message);
            return;
        }

        const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

        // 3. Create Workout
        console.log('3. Creating workout...');
        let workoutId = '';
        try {
            const workoutRes = await axios.post(`${API_URL}/workouts`, {
                title: 'Test Workout',
                content: '# Test Workout Content',
                originalInput: { goal: 'Hypertrophy' }
            }, authHeaders);
            workoutId = workoutRes.data.id;
            console.log('✅ Create workout success');
        } catch (e: any) {
            console.error('❌ Create workout failed:', e.response?.data || e.message);
        }

        // 4. Get Workouts
        console.log('4. Fetching workouts...');
        try {
            const workoutsRes = await axios.get(`${API_URL}/workouts`, authHeaders);
            if (workoutsRes.data.length > 0) {
                console.log(`✅ Fetch workouts success (Found ${workoutsRes.data.length})`);
            } else {
                console.warn('⚠️ Fetch workouts returned empty list');
            }
        } catch (e: any) {
            console.error('❌ Fetch workouts failed:', e.response?.data || e.message);
        }

        // 5. Delete Workout
        console.log('5. Deleting workout...');
        try {
            await axios.delete(`${API_URL}/workouts/${workoutId}`, authHeaders);
            console.log('✅ Delete workout success');
        } catch (e: any) {
            console.error('❌ Delete workout failed:', e.response?.data || e.message);
        }

        console.log('--- Test Complete ---');

    } catch (error: any) {
        console.error('Unexpected error:', error.message);
    }
};

testApi();
