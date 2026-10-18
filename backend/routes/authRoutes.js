let express = require('express');
let router = express.Router();
let authController = require('../controllers/authController');
let { protect } = require('../middleware/authMiddleware');
let User = require('../models/User'); 

// Standard Auth Routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Password Reset Routes (Self-Service)
router.post('/forgot-password', authController.forgotPassword);
router.put('/reset-password', authController.resetPassword);

// Profile Routes
router.get('/profile', protect, async (req, res) => {
  try {
    let user = await User.findById(req.user).select('-password'); 
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/profile', protect, async (req, res) => {
  try {
    let { name, email } = req.body;
    let user = await User.findByIdAndUpdate(
      req.user, 
      { name, email }, 
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;