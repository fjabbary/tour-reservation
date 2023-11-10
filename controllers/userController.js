const User = require('../models/UserModel')

exports.getAllUsers = async (req, res) => {
    const users = await User.find()

    res.status(200).json({
        status: 'success',
        data: users
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