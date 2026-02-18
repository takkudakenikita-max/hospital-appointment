const Doctor = require('../models/Doctor');

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public
exports.getDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find().populate('hospital', 'name');
        res.json(doctors);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
exports.getDoctorById = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id).populate('hospital', 'name');
        if (!doctor) {
            return res.status(404).json({ msg: 'Doctor not found' });
        }
        res.json(doctor);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Doctor not found' });
        }
        res.status(500).send('Server Error');
    }
};

// @desc    Create a doctor
// @route   POST /api/doctors
// @access  Private (Admin only)
exports.createDoctor = async (req, res) => {
    // Check if user is admin
    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Access denied. Admin only.' });
    }

    const { name, specialization, hospital, fees, experience, availableSlots } = req.body;

    try {
        const newDoctor = new Doctor({
            name,
            specialization,
            hospital,
            fees,
            experience,
            availableSlots
        });

        const doctor = await newDoctor.save();
        res.json(doctor);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
