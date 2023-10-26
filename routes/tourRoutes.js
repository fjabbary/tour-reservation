const express = require('express');
const { getAllTours, addTour, getTour, updateTour, deleteTour, checkBody } = require('../controllers/tourController')

const router = express.Router();

router.route('/')
    .get(getAllTours)
    .post(checkBody, addTour)

router.route('/:id')
    .get(getTour)
    .patch(updateTour)
    .delete(deleteTour);



module.exports = router;    