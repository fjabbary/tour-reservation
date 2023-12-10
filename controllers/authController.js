const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const sendEmail = require('../utils/email');
const crypto = require('crypto');

const signToken = id => {
    return jwt.sign({ id: id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true
}

const sendTokenCookie = (user, res) => {
    const token = signToken(user._id)
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    res.cookie('jwt', token, cookieOptions)
    user.password = undefined;


    res.status(201).json({
        status: 'success',
        token,
        data: {
            user
        }
    })
}

exports.signup = async (req, res, next) => {
    try {
        const newUser = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            passwordConfirm: req.body.passwordConfirm,
            passwordChangedAt: req.body.passwordChangedAt,
            role: req.body.role
        })

        sendTokenCookie(newUser, res)

        // Remove password from outtput


    } catch (err) {
        res.status(404).json({
            status: 'Sign up fail',
            message: err
        })
    }
}


exports.login = async (req, res, next) => {

    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            status: 'Please provide email and password'
        })
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return res.status(400).json({
            status: 'Incorrect email and password'
        })
    }

    sendTokenCookie(user, res)

}

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    })

    res.status(200).json({ status: 'success' })
}

exports.protect = async (req, res, next) => {
    // 1) Check if token exists
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return res.status(401).json({
            status: 'You are not logged in'
        });
    }

    // 2) Validate token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
    console.log(decoded);

    // 3) Check user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return res.status(401).json({
            status: 'The user belonged to this token doen\'t exist'
        })
    }

    // 4) Check if user changed password after the token as issued
    if (currentUser.changePasswordAfter(decoded.iat)) {
        return res.sendStatus(401).json({
            status: "Your password has been updated since you logged in"
        })
    }

    req.user = currentUser;
    res.locals.user = currentUser;

    next();
}

// only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {

    if (req.cookies.jwt) {
        try {
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET)

            // 3) Check user still exists
            const currentUser = await User.findById(decoded.id);
            if (!currentUser) {
                return res.status(401).json({
                    status: 'The user belonged to this token doen\'t exist'
                })
            }

            // 4) Check if user changed password after the token as issued
            if (currentUser.changePasswordAfter(decoded.iat)) {
                return res.sendStatus(401).json({
                    status: "Your password has been updated since you logged in"
                })
            }

            res.locals.user = currentUser;
            return next();
        } catch (e) {
            return next();
        }


    }
    next();
}


// ['admin', 'guide-lead']
exports.restrictTo = (...roles) => {

    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(401).json({
                status: 'You don\'t have permission to perform this action'
            })
        }
        next()
    }
}

exports.forgotPassword = async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
        return res.status(404).json({
            error: 'Email not found.'
        })
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });


    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}. \nIf you didn't make this request, please ignore this email!`;


    try {
        await sendEmail({
            email: user.email,
            subject: 'Password Reset Token (Valid for 10 minutes)',
            message
        })

        res.status(200).json({
            status: 'success',
            message: 'Check your email for a password reset link!'
        })
    }

    catch (e) {

        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        await user.save({ validateBeforeSave: false });

        return res.json({
            message: 'Error in sending email'
        })
    }

}

exports.resetPassword = async (req, res, next) => {
    // get user based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } })

    // if token has not expired, and there is user, set new password
    if (!user) {
        return res.status(400).json({
            error: 'Invalid or Expired token'
        })
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    // updated changePasswordAt property for the user

    // Log user in
    sendTokenCookie(user, res)

}

exports.updatePassword = async (req, res, next) => {
    // Get user from collection  1234abcd   
    const user = await User.findById(req.user.id).select('+password');
    // Check if posted password is correct

    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return res.status(401).json({
            status: 'Current password is incorrect'
        })
    }

    // If so, update password
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    // Log user in, send JWT 
    sendTokenCookie(user, res)
}