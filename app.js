const express = require('express');

const app = express();
const morgan = require('morgan');
const appError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require("hpp");
const path = require('path');

const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/reviewRoutes');


app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES
// Serving statuc files
app.use(express.static(path.join(__dirname, 'public')))

// Set security HTTP headers
app.use(helmet());

// Develoment logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}
// Limit request per API
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 min
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again in an hour.'
})

app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data Sanitization against NoSQL query injection
app.use(mongoSanitize())
// Data Sanitization against XSS
app.use(xss());

// Prevent parameter polution
app.use(hpp({
    whitelist: ['duration',
        'ratingsAverage',
        'maxGroupSize',
        'ratingsQuantity',
        'price',
        'difficulty',
        'summary']
}))

// Test middleware 
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    // console.log(req.headers);
    next();
})

// ROUTES

app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/reviews', reviewRouter)

// ============================================================= 
const Tour = require('./models/tourModel');


app.get('/', async (req, res) => {
    const tours = await Tour.find();

    res.status(200).render('overview', {
        title: 'All Tours',
        tours
    })
})

app.get('/tour/:slug', async (req, res) => {
    const slug = req.params.slug;
    const tour = await Tour.findOne({ slug: slug }).populate({
        path: 'reviews',
        fields: 'review rating user'
    })

    res.status(200).render('tour', {
        title: tour.name,
        tour
    })
})



app.all('*', (req, res, next) => {
    next(new appError(`Can't find ${req.originalUrl} on this server!`, 404));
})

// app.use(globalErrorHandler)

module.exports = app;