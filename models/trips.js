const mongoose = require('mongoose');

const tripsSchema = mongoose.Schema({
    departure: { type: String },
    arrival: { type: String },
    date: { type: Date },
    price: { type: Number }
});

const Trips = mongoose.model('trips', tripsSchema);

module.exports = Trips;