const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');

exports.getAllReviews = async (req, res, next) => {
    try {
        let filter = {}
        if (req.params.tourId) filter = { tour: req.params.tourId }

        const reviews = await Review.find(filter);

        res.status(200).json({
            status: 'success',
            message: 'Review created',
            results: reviews.length,
            data: reviews
        })


    } catch (err) {
        console.log(err);
    }
}

exports.setTourUserIds = (req, res, next) => {
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;

    next();
}

exports.createReview = factory.createOne(Review)
exports.updateReview = factory.updateOne(Review)
exports.deleteReview = factory.deleteOne(Review) 