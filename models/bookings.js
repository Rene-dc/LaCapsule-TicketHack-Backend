const mongoose = require('mongoose');

const bookingsSchema = mongoose.Schema({
    trip: { type: mongoose.Schema.ObjectId, ref:'trips' }
});

const Booking = mongoose.model('bookings', bookingsSchema);

module.exports = Booking;