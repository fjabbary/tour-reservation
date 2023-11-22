const Review = require('../models/reviewModel');

exports.getAllReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find().populate('tour').populate('user');

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

exports.createReview = async (req, res, next) => {
    console.log('ssssaaax');
    const newReview = await Review.create(req.body)

    res.status(201).json({
        status: 'success',
        message: 'Review created',
        data: newReview
    })

}