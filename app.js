const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;
const morgan = require('morgan');


// 1) MIDDLEWARES
app.use(morgan('dev'))
app.use(express.json())

app.use((req, res, next) => {
    console.log('Hello from the middleware 😊');
    next();
})

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
})

const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`))


// 2) Route Handlers
const getAllTours = (req, res) => {
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

const getTour = (req, res) => {

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

const addTour = (req, res) => {
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

const updateTour = (req, res) => {

}

const deleteTour = (req, res) => {
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

const getAllUsers = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined'
    })
}

const getUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined'
    })
}

const createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined'
    })
}

const updateUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined'
    })
}

const deleteUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined'
    })
}


// 3) ROUTES
app.route('/api/v1/tours')
    .get(getAllTours)
    .post(addTour)

app.route('/api/v1/tours/:id')
    .get(getTour)
    .patch(updateTour)
    .delete(deleteTour);

app.route('/api/v1/users')
    .get(getAllUsers)
    .post(createUser)

app.route('/api/v1/tours/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser);

// 4) START SERVER
app.listen(port, () => {
    console.log(`App running at port ${port}`);
})