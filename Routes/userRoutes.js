const express = require('express');

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);
router.patch(
    '/update-password',
    authController.protect,
    authController.updatePassword
);

//Protect all routes after this middleware
router.use(authController.protect);

router.patch(
    '/update-my-data',
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    userController.updateMe
);

router.delete('/delete-my-data', userController.deleteMe);

router.get('/me', userController.getMe, userController.getUser);

//Restrict the routes after this to only admins
router.use(authController.restrictTo('admin'));

// User route
router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);

router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;