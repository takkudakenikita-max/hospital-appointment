const getFetch = async () => {
    try {
        return require('node-fetch');
    } catch (e) {
        if (global.fetch) return global.fetch;
        throw new Error('Fetch API not available. Please use Node.js v18+ or install node-fetch.');
    }
};

const BASE_URL = 'http://localhost:5000/api';

const doctorsToSeed = [
    {
        name: 'Dr. Emily Blunt',
        specialization: 'Neurology',
        fees: 200,
        experience: 12
    },
    {
        name: 'Dr. John Watson',
        specialization: 'General Medicine',
        fees: 100,
        experience: 8
    },
    {
        name: 'Dr. Sarah Connor',
        specialization: 'Orthopedics',
        fees: 180,
        experience: 15
    },
    {
        name: 'Dr. Hannibal Lecter',
        specialization: 'Psychiatry',
        fees: 300,
        experience: 25
    }
];

async function seedDoctors() {
    console.log('Starting Seed Process...');
    const fetch = await getFetch();

    // 1. Register/Login Admin
    console.log('Authenticating Admin...');
    let adminToken;
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'admin_seed@test.com',
            password: 'password123'
        })
    });

    if (loginRes.ok) {
        const data = await loginRes.json();
        adminToken = data.token;
    } else {
        // Register if login fails (first time)
        const regRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Seed Admin',
                email: 'admin_seed@test.com',
                password: 'password123',
                role: 'admin'
            })
        });
        const data = await regRes.json();
        adminToken = data.token;
    }

    if (!adminToken) {
        console.error('Failed to get admin token');
        return;
    }
    console.log('Admin Authenticated');

    // 2. Get Hospital
    console.log('Fetching Hospitals...');
    const hospRes = await fetch(`${BASE_URL}/hospitals`);
    const hospitals = await hospRes.json();

    let hospitalId;
    if (hospitals.length > 0) {
        hospitalId = hospitals[0]._id;
        console.log(`Using Hospital: ${hospitals[0].name}`);
    } else {
        // Create one if none exists
        console.log('No hospitals found. Creating one...');
        const newHospRes = await fetch(`${BASE_URL}/hospitals`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': adminToken
            },
            body: JSON.stringify({
                name: 'City General Hospital',
                address: '123 Main St',
                phone: '555-0000',
                email: 'info@citygen.com'
            })
        });
        const newHosp = await newHospRes.json();
        hospitalId = newHosp._id;
        console.log(`Created Hospital: ${newHosp.name}`);
    }

    // 3. Create Doctors
    console.log(`\nSeeding ${doctorsToSeed.length} doctors...`);
    for (const doc of doctorsToSeed) {
        const res = await fetch(`${BASE_URL}/doctors`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': adminToken
            },
            body: JSON.stringify({
                ...doc,
                hospital: hospitalId,
                availableSlots: [] // Can add slots later if needed
            })
        });
        const data = await res.json();
        if (res.ok) {
            console.log(`Created: ${data.name} (${data.specialization})`);
        } else {
            console.error(`Failed to create ${doc.name}:`, data);
        }
    }

    console.log('\nSeeding Complete!');
}

seedDoctors().catch(err => console.error(err));
