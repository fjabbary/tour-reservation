const fs = require('fs');
const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`))


exports.checkBody = (req, res, next) => {
    if (!req.body.name || !req.body.price) {
        return res.json({
            status: 'fail',
            message: 'invalid request'
        })
    }

    next();
}

exports.getAllTours = (req, res) => {
    console.log(req.requestTime);
    res.json({
        status: 'success',
        results: tours.length,
        requestedAt: req.requestTime,
        data: {
            tours
        }
    })
}

exports.getTour = (req, res) => {
    const id = req.params.id;
    const tour = tours.find(item => item.id === +id);

    if (!tour) {
        res.json({
            status: 'Failed',
            message: `No tour with ID ${id}`
        })
    }

    res.json({
        status: 'success',
        data: {
            tour
        }
    })
}



exports.addTour = (req, res) => {
    const newId = tours[tours.length - 1].id + 1;
    const newTour = Object.assign({ id: newId }, req.body)

    tours.push(newTour);

    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), (err) => {
        res.json({
            status: 'success',
            data: {
                tour: newTour
            }
        })

        console.log(newTour);
    })
}

exports.updateTour = (req, res) => {

}

exports.deleteTour = (req, res) => {
    const id = req.params.id;
    const index = tours.findIndex(item => item.id === id);
    const deletedTour = tours.splice(index, 1);

    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), (err) => {
        res.json({
            status: 'success',
            data: {
                tour: deletedTour
            }
        })
    })
}