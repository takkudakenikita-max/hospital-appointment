const Hospital = require('../models/Hospital');

// @desc    Get all hospitals
// @route   GET /api/hospitals
// @access  Public
exports.getHospitals = async (req, res) => {
    try {
        const hospitals = await Hospital.find();
        res.json(hospitals);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Create a hospital
// @route   POST /api/hospitals
// @access  Private (Admin only)
exports.createHospital = async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Access denied. Admin only.' });
    }

    const { name, address, phone, email } = req.body;

    try {
        const newHospital = new Hospital({
            name,
            address,
            phone,
            email
        });

        const hospital = await newHospital.save();
        res.json(hospital);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
