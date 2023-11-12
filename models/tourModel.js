const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true,
        minlength: [10, 'The tour name must have less or euqal than 40 characters'],
        maxlength: [40, 'The tour name must have more or euqal than 40 characters'],
        validate: [validator.isAlpha, 'Tour name must only contain characters']
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a maximum group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty level'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty level must be easy, medium or difficult'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0']
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function (val) {
                return val < this.price
            },
            message: 'The price ({VALUE}) must be higher than the price Discount'
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a summary']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have an image cover']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    }

}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});

// Runs when Save or create data
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true })
    next();
});

tourSchema.post('save', function (doc, next) {
    console.log(`${doc} has been saved`)
    next();
});

// QUERY MIDDLEWARE
tourSchema.pre(/^find/, function (next) {
    // this points to the current query
    this.find({ secretTour: { $ne: true } })
    this.start = Date.now();
    next();
})

tourSchema.post(/^find/, function (docs, next) {
    // this points to the current query
    console.log(`Query took ${Date.now() - this.start} milliseconds`);
    next();
})

// AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } })
    next();
})

const Tour = mongoose.model('Tour', tourSchema)

module.exports = Tour; 