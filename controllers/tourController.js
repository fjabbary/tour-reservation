const Tour = require('../models/tourModel')


exports.getAllTours = async (req, res) => {

    try {
        const queryObj = { ...req.query };
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => delete queryObj[el])

        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)

        let query = Tour.find(JSON.parse(queryStr));

        if (req.query.sort) {
            query = query.sort(req.query.sort.split(',').join(' '))
        } else {
            query = query.sort('-createdAt');
        }

        const tours = await query;

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
    try {
        const newTour = await Tour.create(req.body)

        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        })
    } catch (err) {
        res.status(400).json({
            status: 'Fail',
            message: 'Invalid data sent!'
        })
    }

}

exports.updateTour = async (req, res) => {
    try {
        const id = req.params.id;
        const updatedTour = await Tour.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

        res.status(201).json({
            status: 'success',
            data: {
                tour: updatedTour
            }
        })
    } catch (err) {
        res.status(400).json({
            status: 'Fail',
            message: 'Invalid data sent!'
        })
    }
}

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