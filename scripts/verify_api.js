const getFetch = async () => {
    try {
        return require('node-fetch');
    } catch (e) {
        if (global.fetch) return global.fetch;
        throw new Error('Fetch API not available. Please use Node.js v18+ or install node-fetch.');
    }
};

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
    console.log('Starting Verification...');
    const fetch = await getFetch();

    // 1. Register User
    console.log('\n1. Registering User...');
    const userRes = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'Test Patient',
            email: `patient_${Date.now()}@test.com`,
            password: 'password123',
            role: 'patient'
        })
    });
    const userData = await userRes.json();
    console.log('Register Status:', userRes.status);
    if (!userRes.ok) console.log('Error:', userData);
    const token = userData.token;
    console.log('Token received:', !!token);

    // 2. Register Admin for Doctor Creation
    console.log('\n2. Registering Admin...');
    const adminRes = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'Test Admin',
            email: `admin_${Date.now()}@test.com`,
            password: 'password123',
            role: 'admin'
        })
    });
    const adminData = await adminRes.json();
    const adminToken = adminData.token;
    console.log('Admin Token received:', !!adminToken);


    // 3. Create Hospital (Admin)
    console.log('\n3. Creating Hospital...');
    const hospRes = await fetch(`${BASE_URL}/hospitals`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': adminToken
        },
        body: JSON.stringify({
            name: 'General Hospital',
            address: '123 Health St',
            phone: '555-0123',
            email: 'contact@genhospital.com'
        })
    });
    const hospData = await hospRes.json();
    console.log('Create Hospital Status:', hospRes.status);
    const hospitalId = hospData._id;

    // 4. Create Doctor (Admin)
    console.log('\n4. Creating Doctor...');
    if (!hospitalId) {
        console.log('Skipping Doctor creation (No Hospital ID)');
    } else {
        const docRes = await fetch(`${BASE_URL}/doctors`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': adminToken
            },
            body: JSON.stringify({
                name: 'Dr. Smith',
                specialization: 'Cardiology',
                hospital: hospitalId,
                fees: 150,
                experience: 10
            })
        });
        const docData = await docRes.json();
        console.log('Create Doctor Status:', docRes.status);
        if (!docRes.ok) console.log(docData);
        var doctorId = docData._id;
    }

    // 5. Get Doctors (Public)
    console.log('\n5. Fetching Doctors...');
    const getDocsRes = await fetch(`${BASE_URL}/doctors`);
    const docs = await getDocsRes.json();
    console.log('Doctors found:', docs.length);

    // 6. Book Appointment (Patient)
    console.log('\n6. Booking Appointment...');
    if (!doctorId) {
        console.log('Skipping Appointment (No Doctor ID)');
    } else {
        const bookRes = await fetch(`${BASE_URL}/appointments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify({
                doctorId: doctorId,
                date: '2023-12-25'
            })
        });
        const bookData = await bookRes.json();
        console.log('Book Appointment Status:', bookRes.status);
        if (!bookRes.ok) console.log(bookData);
    }
}

runTests().catch(err => console.error(err));
