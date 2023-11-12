const User = require('../models/UserModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const signToken = id => {
    return jwt.sign({ id: id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
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

        const token = signToken(newUser._id)

        res.status(201).json({
            status: 'success',
            token,
            data: {
                user: newUser
            }
        })
    } catch (err) {
        res.status(404).json({
            status: 'fail',
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

    const token = signToken(user._id);

    // req.setHeader('Authorization', 'Bearer ' + token)

    res.status(200).json({
        status: 'success',
        token
    })
}

exports.protect = async (req, res, next) => {
    // 1) Check if token exists
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            status: 'Access denied'
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

    next();
}

// ['admin', 'guide-lead']
exports.restrictTo = (...roles) => {
    console.log(roles);
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(401).json({
                status: 'You don\'t have permission to perform this action'
            })
        }
        next()
    }
}