const express = require('express');
const router = express.Router();
const hospitalController = require('../controllers/hospitalController');
const auth = require('../middleware/authMiddleware');

router.get('/', hospitalController.getHospitals);
router.post('/', auth, hospitalController.createHospital);

module.exports = router;
