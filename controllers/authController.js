const User = require('../models/UserModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');


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
            passwordConfirm: req.body.passwordConfirm
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
    console.log(!user.correctPassword(password, user.password));

    if (!user || !(await user.correctPassword(password, user.password))) {
        return res.status(400).json({
            status: 'Incorrect email and password'
        })
    }

    const token = signToken(user._id);

    res.status(200).json({
        status: 'success',
        token
    })

}