const User = require('../models/userModel')
const factory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');

// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/img/users')
//     },
//     filename: (req, file, cb) => {
//         const ext = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//     }
// })

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb("Error: Only image files are allowed.", false);
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
})

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = async (req, res, next) => {
    if (!req.file) return next();

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer).resize(500, 500).toFormat('jpeg').jpeg({ quality: 90 }).toFile(`public/img/users/${req.file.filename}`);
    next();
}


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
    // console.log(req.file);
    // console.log(req.body);

    // create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
        return res.status(400).json({
            status: 'This route is not for password updates.'
        })
    }

    const filteredBody = filterObj(req.body, 'name', 'email');
    if (req.file) filteredBody.photo = req.file.filename


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