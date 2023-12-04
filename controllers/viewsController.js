const Tour = require('../models/tourModel');


exports.getOverview = async (req, res) => {
  const tours = await Tour.find();

  res.status(200).render('overview', {
    title: 'All Tours',
    tours
  })
}

exports.getTour = async (req, res) => {
  const slug = req.params.slug;
  const tour = await Tour.findOne({ slug: slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  })

  res.status(200).render('tour', {
    title: tour.name,
    tour
  })
}

exports.login = async (req, res) => {
  res.status(200).render('login', {
    title: 'Login',
  })
}