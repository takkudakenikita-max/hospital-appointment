const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // Assuming bcryptjs is needed, though not explicitly in deps list, I should check or standard usage. Wait, user didn't ask for it but it's standard. I'll stick to simple if needed or add it. The user has 'dependencies' listed in package.json from view_file: express, mongoose, dotenv, cors. NO bcrypt. I should probably add it or use simple string comparison for now if I can't run npm install.
// BUT, I can run npm commands. I'll add bcryptjs to the plan or just use it and tell user to install. 
// Actually, for a quick prototype, I might skip hashing if I can't install. 
// Use `npm install bcryptjs` if possible. I'll assume I can or I will just write code that needs it. 
// "Install dependencies" was a task. I'll assume standard auth needs it.
// I'll check if I can run commands. Yes I can.
// But first I'll write the code without bcrypt if I want to be safe, OR mostly likely I should add it.
// I'll use simple text for now to avoid dependency hell if I can't install, 
// RE-READ: I can run `npm install`.
// I will just use plain text for password for simplicity as requested "Project Ideas & Architecture" -> "Hospital Appointment Booking API". 
// Secure is better. I'll try to require bcryptjs. If it fails, I'll advise user.
// actually, I'll essentially execute `npm install bcryptjs jsonwebtoken` in a separate turn or assume it's there. 
// Wait, `jsonwebtoken` is also not in the `package.json` I saw earlier?
// package.json had: cors, dotenv, express, mongoose.
// I NEED to install `jsonwebtoken` and `bcryptjs`.
// I will include a command to install them.
// Backend is node.

// For now, I'll write the controller assuming they exist and run the install command.

exports.register = async (req, res) => {
    const { name, email, password, role, phone } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({
            name,
            email,
            password, // In real app, hash this!
            role,
            phone
        });

        // Simple hashing placeholder if bcrypt not available, but ideally use bcrypt.
        // await user.save(); 

        // I will implement with bcryptjs but run install command.

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret',
            { expiresIn: 360000 },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret',
            { expiresIn: 360000 },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.getPatients = async (req, res) => {
    try {
        const patients = await User.find({ role: 'patient' }).select('-password');
        res.json(patients);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
