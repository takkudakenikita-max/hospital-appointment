const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

// @desc    Book an appointment
// @route   POST /api/appointments
// @access  Private
exports.bookAppointment = async (req, res) => {
    const { doctorId, date } = req.body;

    try {
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ msg: 'Doctor not found' });
        }

        const newAppointment = new Appointment({
            patient: req.user.id,
            doctor: doctorId,
            date
        });

        const appointment = await newAppointment.save();
        res.json(appointment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get user appointments
// @route   GET /api/appointments/my-appointments
// @access  Private
exports.getMyAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ patient: req.user.id })
            .populate('doctor', ['name', 'specialization'])
            .sort({ date: -1 });
        res.json(appointments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private
exports.cancelAppointment = async (req, res) => {
    try {
        let appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ msg: 'Appointment not found' });
        }

        // Make sure user owns appointment
        if (appointment.patient.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        appointment.status = 'cancelled';
        await appointment.save();

        res.json(appointment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
