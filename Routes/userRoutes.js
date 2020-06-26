const express = require('express');

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);
router.patch(
    '/update-password',
    authController.protect,
    authController.updatePassword
);
router.patch(
    '/update-my-data',
    authController.protect,
    userController.updateMe
);

router.delete(
    '/delete-my-data',
    authController.protect,
    userController.deleteMe
);

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