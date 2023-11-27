const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = Model => async (req, res) => {
    try {
        const id = req.params.id;
        await Model.findByIdAndDelete(id)

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


exports.updateOne = Model => async (req, res) => {

    const id = req.params.id;
    const doc = await Model.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    res.status(201).json({
        status: 'success',
        data: {
            data: doc
        }
    })
}

exports.createOne = (Model) => async (req, res) => {
    const doc = await Model.create(req.body)

    res.status(201).json({
        status: 'success',
        data: {
            data: doc
        }
    })
}

exports.getOne = (Model, populateOptions) => async (req, res) => {
    try {
        let query = Model.findById(req.params.id);
        if (populateOptions) {
            query = query.populate(populateOptions)
        }
        const doc = await query;

        res.status(200).json({
            status: 'success',
            data: {
                data: doc
            }
        })
    }
    catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }
}

exports.getAll = Model => async (req, res) => {

    try {
        let filter = {}
        if (req.params.tourId) filter = { tour: req.params.tourId }

        const features = new APIFeatures(Model.find(), req.query).filter(filter).sort().limitFields().paginate();

        const doc = await features.query;

        res.status(200).json({
            status: 'success',
            results: doc.length,
            data: {
                data: doc
            }
        })
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }
}