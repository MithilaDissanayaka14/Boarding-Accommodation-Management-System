const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { uploadImages } = require('../middlewares/uploadMiddleware');
const {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  updatePasswordSchema,
} = require('../validations/authValidation');

router.post('/register', validate({ body: registerSchema }), authController.register);
router.post('/login', validate({ body: loginSchema }), authController.login);
router.post('/refresh', authController.refreshAuthToken);
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);
router.patch('/profile', protect, validate({ body: updateProfileSchema }), authController.updateProfile);
router.patch('/avatar', protect, uploadImages.single('avatar'), authController.uploadAvatar);
router.patch('/update-password', protect, validate({ body: updatePasswordSchema }), authController.updatePassword);

module.exports = router;
