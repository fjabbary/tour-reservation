const Tour = require('../models/tourModel')


exports.getAllTours = async (req, res) => {

    try {
        const tours = await Tour.find();

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