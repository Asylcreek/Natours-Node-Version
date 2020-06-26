const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../Utils/catchAsync');
const AppError = require('../Utils/appError');
const sendEmail = require('../Utils/email');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

const createAndSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),

        httpOnly: true,
    };

    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    res.cookie('jwt', token, cookieOptions);

    //To remove the password field from the output
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user,
        },
    });
};

exports.signup = catchAsync(async(req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt,
        role: req.body.role,
    });

    createAndSendToken(newUser, 201, res);
});

exports.login = catchAsync(async(req, res, next) => {
    const { email, password } = req.body;

    //Check if email and password were given by the user
    if (!email || !password) {
        return next(new AppError('Please provide an email and password', 400));
    }

    //Check if user exists and password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    //Send token to client if all is well
    createAndSendToken(user, 200, res);
});

exports.protect = catchAsync(async(req, res, next) => {
    let token;
    //Get JWT Token and check if it exists
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(
            new AppError('You are not logged in. Please log in to gain access.', 401)
        );
    }
    //Verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    //Check if the user exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(
            new AppError('The user with this token does not exist any more', 401)
        );
    }

    //Check if the user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(
            new AppError('User recently changed password. Please log in again.', 401)
        );
    }

    //Grant access to the protected route
    req.user = currentUser;
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError('You do not have permission to perform this action', 403)
            );
        }

        next();
    };
};

exports.forgotPassword = catchAsync(async(req, res, next) => {
    //Get user based on posted email
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new AppError('There is no user with that email address.', 404));
    }

    //Generate the random token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    //Send it to user via email
    const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/reset-password/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you did not forget your password, please ignore this email`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Reset your password. Token expires in 10 minutes',
            message,
        });

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email',
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        await user.save({ validateBeforeSave: false });

        return next(
            new AppError(
                'There was an error sending the email. Try again later!',
                500
            )
        );
    }
    // console.log(user);
});

exports.resetPassword = catchAsync(async(req, res, next) => {
    //Get user based on token

    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });

    //If token not expired and user exists, set the new password
    if (!user) return next(new AppError('Token is invalid or has expired', 400));

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    //Update changedPasswordAt property for the user

    //Log the user in, send JWT
    createAndSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async(req, res, next) => {
    //Get user from collection
    const user = await User.findById(req.user._id).select('+password');

    //Check if posted password is correct
    const { currentPassword } = req.body;
    if (!(await user.correctPassword(currentPassword, user.password))) {
        return next(new AppError('Your current password is wrong', 401));
    }

    //If so, update
    user.password = req.body.newPassword;
    user.passwordConfirm = req.body.newPasswordConfirm;

    await user.save();

    //Log the user in, send JWT
    createAndSendToken(user, 200, res);
});