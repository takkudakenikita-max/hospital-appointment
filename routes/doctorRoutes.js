const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const auth = require('../middleware/authMiddleware');

// Public routes
router.get('/', doctorController.getDoctors);
router.get('/:id', doctorController.getDoctorById);

// Protected routes
router.post('/', auth, doctorController.createDoctor);

module.exports = router;
