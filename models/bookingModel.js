const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema({
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        require: [true, 'Booking must belong to a tour'],
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        require: [true, 'Booking must belong to a user'],
    },
    price: {
        type: Number,
        required: [true, 'Booking must have a price'],
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    paid: {
        type: Boolean,
        default: true,
    },
});

bookingSchema.pre(/^find/, function(next) {
    const populatePath = [
        { path: 'user', select: 'name' },
        { path: 'tour', select: 'name' },
    ];

    this.populate(populatePath);

    next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;