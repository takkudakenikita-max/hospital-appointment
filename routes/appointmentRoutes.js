const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, appointmentController.bookAppointment);
router.get('/my-appointments', auth, appointmentController.getMyAppointments);
router.put('/:id/cancel', auth, appointmentController.cancelAppointment);

module.exports = router;
