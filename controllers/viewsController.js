const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');

exports.getOverview = async (req, res) => {
  const tours = await Tour.find();

  res.status(200).render('overview', {
    title: 'All Tours',
    tours
  })
}

exports.getTour = async (req, res, next) => {
  const slug = req.params.slug;
  const tour = await Tour.findOne({ slug: slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  })

  if (!tour) {
    return next(new AppError('There is no tour with this name', 404))
  }

  res.status(200).render('tour', {
    title: tour.name,
    tour
  })
}

exports.login = (req, res) => {
  res.status(200).render('login', {
    title: 'Login',
  })
}

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your Account',
  })
}

exports.updateUserData = async (req, res, next) => {
  const uupdatedUser = await User.findByIdAndUpdate(req.user.id, {
    name: req.body.name,
    email: req.body.email
  },
    {
      new: true,
      runValidators: true
    })

  res.status(200).render('account', {
    title: 'Your Account',
    user: uupdatedUser
  })
}