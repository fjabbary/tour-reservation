const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5'
    req.query.sort = 'price'
    req.query.fields = 'name, price, ratingsAverage, summary, difficulty';
    next();
}

exports.getAllTours = async (req, res) => {

    try {
        const features = new APIFeatures(Tour.find(), req.query).filter().sort().limitFields().paginate();

        const tours = await features.query;

        res.status(200).json({
            status: 'success',
            results: tours.length,
            data: tours
        })
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }
}

exports.getTour = async (req, res) => {
    try {
        const id = req.params.id;
        const tour = await Tour.findById(id)

        res.status(200).json({
            status: 'success',
            data: tour
        })
    }
    catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }
}

exports.addTour = async (req, res) => {
    const newTour = await Tour.create(req.body)

    res.status(201).json({
        status: 'success',
        data: {
            tour: newTour
        }
    })
}

exports.updateTour = catchAsync(async (req, res) => {

    const id = req.params.id;
    const updatedTour = await Tour.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    res.status(201).json({
        status: 'success',
        data: {
            tour: updatedTour
        }
    })

})

exports.deleteTour = async (req, res) => {
    try {
        const id = req.params.id;
        await Tour.findByIdAndDelete(id)

        res.status(200).json({
            status: 'success'
        })
    } catch (err) {
        res.status(400).json({
            status: 'Fail',
            message: 'Invalid data sent!'
        })
    }
}

exports.getTourStats = async (req, res) => {
    try {
        const stats = await Tour.aggregate([
            {
                $match: { ratingsAverage: { $gte: 4.5 } }
            },
            {
                $group: {
                    _id: { $toUpper: '$difficulty' },
                    numRatings: { $sum: '$ratingsQuantity' },
                    numOfTours: { $sum: 1 },
                    averageRatingValue: { $avg: '$ratingsAverage' },
                    avgPrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' }
                }
            },
            {
                $sort: { avgPrice: 1 }
            },
            // {
            //     $match: { _id: { $ne: 'EASY' } }
            // }
        ])

        res.status(200).json({
            status: 'Success',
            data: {
                stats
            }
        })


    } catch (error) {
        res.status(400).json({
            status: 'Fail',
            message: 'Invalid data sent!'
        })
    }
}

exports.getMonthlyPlan = async (req, res) => {
    try {

        const year = req.params.year * 1;
        const plan = await Tour.aggregate([
            {
                $unwind: "$startDates"
            },
            {
                $match: {
                    startDates: {
                        $gte: new Date(`${year}-01-01`),
                        $lt: new Date(`${year + 1}-01-01`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: '$startDates' },
                    numTourStart: { $sum: 1 },
                    tours: { $push: '$name' }
                }
            },
            {
                $addFields: { month: '$_id' }
            },
            {
                $project: {
                    '_id': false
                }
            },
            {
                $sort: { numTourStart: -1 }
            },
            {
                $limit: 12
            }
        ])

        res.status(200).json({
            status: 'Success',
            result: plan.length,
            data: {
                plan
            }
        })


    } catch (error) {
        res.status(400).json({
            status: 'Fail',
            message: 'Invalid data sent!'
        })
    }
}