const API_URL = 'http://localhost:5000/api';

function showSection(sectionId) {
    document.querySelectorAll('main > section').forEach(section => {
        section.classList.add('hidden-section');
        section.classList.remove('active-section');
    });
    document.getElementById(sectionId).classList.add('active-section');
    document.getElementById(sectionId).classList.remove('hidden-section');

    // Auto-load data based on section
    if (sectionId === 'doctors') {
        loadDoctors();
    } else if (sectionId === 'appointments') {
        loadAppointments();
    } else if (sectionId === 'patients') {
        loadPatients();
    }
}

// Helper to get token
function getToken() {
    return localStorage.getItem('token');
}

function setToken(token) {
    localStorage.setItem('token', token);
    updateNav();
}

function logout() {
    localStorage.removeItem('token');
    updateNav();
    showSection('home');
}

function updateNav() {
    const token = getToken();
    const authLink = document.getElementById('auth-link');
    const navLinks = document.getElementById('nav-links');

    // Remove existing "My Appointments" link if any
    const existingAppLink = document.getElementById('my-appointments-link');
    if (existingAppLink) existingAppLink.remove();

    if (token) {
        authLink.innerHTML = '<a href="#" onclick="logout()">Logout</a>';

        // Add My Appointments link
        const appLink = document.createElement('li');
        appLink.id = 'my-appointments-link';
        appLink.innerHTML = '<a href="#" onclick="showSection(\'appointments\')">My Appointments</a>';
        navLinks.insertBefore(appLink, authLink);

        // Add Patients link (for demo purpose, accessible to all logged in users)
        const patientsLink = document.createElement('li');
        patientsLink.id = 'patients-link';
        patientsLink.innerHTML = '<a href="#" onclick="showSection(\'patients\')">Patients</a>';
        navLinks.insertBefore(patientsLink, authLink);
    } else {
        authLink.innerHTML = '<a href="#" onclick="showSection(\'login\')">Login</a>';
    }
}

// Fetch and display doctors
async function loadDoctors() {
    try {
        const res = await fetch(`${API_URL}/doctors`);
        const doctors = await res.json();

        const doctorList = document.getElementById('doctor-list');
        doctorList.innerHTML = '';

        if (doctors.length === 0) {
            doctorList.innerHTML = '<p>No doctors found.</p>';
            return;
        }

        doctors.forEach(doc => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.innerHTML = `
                <h3>${doc.name}</h3>
                <p><strong>Specialization:</strong> ${doc.specialization}</p>
                <p><strong>Hospital:</strong> ${doc.hospital ? doc.hospital.name : 'N/A'}</p>
                <p><strong>Fees:</strong> $${doc.fees}</p>
                <button onclick="bookAppointment('${doc._id}')">Book Appointment</button>
            `;
            doctorList.appendChild(card);
        });
    } catch (err) {
        console.error('Error loading doctors:', err);
        document.getElementById('doctor-list').innerHTML = '<p>Error loading doctors.</p>';
    }
}

// Fetch and display user appointments
async function loadAppointments() {
    const token = getToken();
    if (!token) return;

    try {
        const res = await fetch(`${API_URL}/appointments/my-appointments`, {
            headers: { 'x-auth-token': token }
        });
        const appointments = await res.json();

        const list = document.getElementById('appointment-list');
        list.innerHTML = '';

        if (appointments.length === 0) {
            list.innerHTML = '<p>No appointments found.</p>';
            return;
        }

        appointments.forEach(app => {
            const card = document.createElement('div');
            card.classList.add('card');
            const date = new Date(app.date).toLocaleDateString();
            card.innerHTML = `
                <h3>${app.doctor ? app.doctor.name : 'Unknown Doctor'}</h3>
                <p><strong>Specialization:</strong> ${app.doctor ? app.doctor.specialization : 'N/A'}</p>
                <p><strong>Date:</strong> ${date}</p>
                <p><strong>Status:</strong> ${app.status}</p>
                ${app.status !== 'cancelled' ? `<button onclick="cancelAppointment('${app._id}')" style="background-color: #dc3545;">Cancel</button>` : ''}
            `;
            list.appendChild(card);
        });
    } catch (err) {
        console.error('Error loading appointments:', err);
        document.getElementById('appointment-list').innerHTML = '<p>Error loading appointments.</p>';
    }
}

// Fetch and display registered patients
async function loadPatients() {
    try {
        const res = await fetch(`${API_URL}/auth/patients`);
        const patients = await res.json();

        const list = document.getElementById('patient-list');
        list.innerHTML = '';

        if (patients.length === 0) {
            list.innerHTML = '<p>No patients found.</p>';
            return;
        }

        patients.forEach(patient => {
            const card = document.createElement('div');
            card.classList.add('card');
            const date = new Date(patient.createdAt).toLocaleDateString();
            card.innerHTML = `
                <h3>${patient.name}</h3>
                <p><strong>Email:</strong> ${patient.email}</p>
                <p><strong>Role:</strong> ${patient.role}</p>
                <p><strong>Joined:</strong> ${date}</p>
            `;
            list.appendChild(card);
        });
    } catch (err) {
        console.error('Error loading patients:', err);
        document.getElementById('patient-list').innerHTML = '<p>Error loading patients.</p>';
    }
}

async function cancelAppointment(id) {
    if (!confirm('Are you sure you want to cancel?')) return;

    const token = getToken();
    try {
        const res = await fetch(`${API_URL}/appointments/${id}/cancel`, {
            method: 'PUT',
            headers: { 'x-auth-token': token }
        });

        if (res.ok) {
            alert('Appointment cancelled');
            loadAppointments();
        } else {
            alert('Failed to cancel');
        }
    } catch (err) {
        console.error(err);
        alert('Error cancelling appointment');
    }
}

async function bookAppointment(doctorId) {
    const token = getToken();
    if (!token) {
        alert('Please login to book an appointment');
        showSection('login');
        return;
    }

    const date = prompt('Enter date (YYYY-MM-DD):');
    if (!date) return;

    try {
        const res = await fetch(`${API_URL}/appointments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify({ doctorId, date })
        });

        const data = await res.json();
        if (res.ok) {
            alert('Appointment booked successfully!');
        } else {
            alert(data.msg || 'Error booking appointment');
        }
    } catch (err) {
        console.error(err);
        alert('Error booking appointment');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    updateNav();
    showSection('home');

    // Login Form
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();
            if (res.ok) {
                setToken(data.token);
                alert('Login successful');
                showSection('home');
            } else {
                alert(data.msg || 'Login failed');
            }
        } catch (err) {
            console.error(err);
            alert('Login error');
        }
    });

    // Register Form
    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const role = document.getElementById('reg-role').value;

        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role })
            });

            const data = await res.json();
            if (res.ok) {
                setToken(data.token);
                alert('Registration successful');
                showSection('home');
            } else {
                alert(data.msg || 'Registration failed');
            }
        } catch (err) {
            console.error(err);
            alert('Registration error');
        }
    });

    // Navigation clicks that need data
    // document.querySelector('a[onclick="showSection(\'doctors\')"]').addEventListener('click', loadDoctors);
});
