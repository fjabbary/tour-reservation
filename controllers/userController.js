const User = require('../models/UserModel')

const filterObj = (obj, ...allowedFields) => {
    const newObject = {};

    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) {
            newObject[el] = obj[el];
        }
    })

    return newObject;
}

exports.getAllUsers = async (req, res) => {
    const users = await User.find()

    res.status(200).json({
        status: 'success',
        data: users
    })
}

exports.updateMe = async (req, res, next) => {
    // create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
        return res.status(400).json({
            status: 'This route is not for password updates.'
        })
    }

    const filteredBody = filterObj(req.body, 'name', 'email');
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true, runValidators: true
    })

    // update user document
    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    })
}

exports.getUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined'
    })
}

exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined'
    })
}

exports.updateUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined'
    })
}

exports.deleteUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined'
    })
}