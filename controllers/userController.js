const User = require('../models/UserModel')
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
    const newObject = {};

    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) {
            newObject[el] = obj[el];
        }
    })

    return newObject;
}


exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
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

exports.deleteMe = async (req, res) => {
    await User.findByIdAndUpdate(req.user.id, { active: false })

    res.status(204).json({
        status: 'success',
        data: null
    })
}


exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined! Please use signup instead.'
    })
}


// Don't update password with this
exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User)
exports.deleteUser = factory.deleteOne(User);
exports.updateUser = factory.updateOne(User);