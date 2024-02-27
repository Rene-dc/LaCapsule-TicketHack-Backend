var express = require('express');
var router = express.Router();

require('../models/connection');
const Trip = require('../models/trips');
const Cart = require('../models/cart');
const Booking = require('../models/bookings');


// 1 POST SEARCH /search --> renvoie la liste des trajets 
// req.body.departure
// req.body.arrival
// req.body.date
router.post('/search', (req, res) => {
	const { departure, arrival, date } = req.body;
	if (!departure || !arrival || !date) {
		return res.status(500).json({ result: false, message: "missing body argument" })
	}

	const searchDate = new Date(date)
	const searchDate1 = new Date(date)
	searchDate1.setDate(searchDate.getDate() + 1)

	Trip.find({
		departure,
		arrival,
		date: {
			$gte: searchDate,
			$lt: searchDate1
		}
	})
	.then((trips) => {
		if (trips.length > 0) {
			return res.status(200).json({ result: true, trips });
		} else {
			return res.status(200).json({ result: false, message: "No trips found" });
		}
	})
	.catch((e) => res.status(500).json({ error: e, message: "Could not find trips" }));
})

// 2 POST BOOK /book --> ajoute le trajet au panier
// req.body.id
router.get('/book/:tripId', (req, res) => {
	// check if id exists
	if (!req.params.tripId) {
		return res.status(500).json({ result: false, message: "missing id" })
	}

	// check if id exists in db
	Trip.findById(req.params.tripId)
	.then(data => {
		if (data) {
			Cart.create({ trip: req.params.tripId })
				.then(trip => {
					if (trip) {
					return res.status(200).json({ result: true })
					} else {
					return res.status(500).json({ result: false, message: "Could not find trip" })
					}
				})
				.catch((e) => res.status(500).json({ error: e, message: "Could not add item to cart" }))
		} else {
			return res.status(500).json({ result: false, message: "Could not find trip item" })
		}
	})
	.catch((e) => res.status(500).json({ error: e, message: "Could not find trip by id" }))
})

// 3 GET CART /cart --> renvoie le panier
router.get('/cart', (req, res) => {
	Cart.find()
	.populate('trip')
	.then((data) => {
		if (data.length > 0) {
			const total = data.reduce((total, item) => total + item.trip.price, 0);
			return res.status(200).json({ result: true, cart: data, total })
		} else {
			return res.status(200).json({ result: false })
		}
	})
	.catch((e) => res.status(500).json({ error: e, message: "Could not find cart" }))
})

// 4 DELETE CART /cart/:item_id --> supprime un item du panier
router.delete('/cart/:cartItemId', (req, res) => {
	Cart.deleteOne({ _id: req.params.cartItemId })
	.then((data) => {
		if (data.acknowledged) {
			return res.json({ result: true });
		} else {
			return res.json({ result: false });
		}
	})
	.catch((e) => res.status(500).json({ error: e, message: "Could not delete item" }))
})

// 5 GET BUY /buy --> supprime le panier et ajoute les trajets à booking
router.get('/buy', (req, res) => {
	Cart.find()
	.then((data) => {
		for (let item of data) {
		Booking.create({ trip: item.trip })
		.then((data) => {
			if (!data) {
			return res.status(500).json({ result: false, message: "Could not add item to bookings" })
			} 
		})
		.catch((e) => {
			return res.status(500).json({ error: e, message: "Could not add item to bookings" })
		})
		}
	})
	.then(() => {
		Cart.deleteMany()
		.then(() => {
			return res.status(200).json({ result: true })
		})
		.catch((e) => res.status(500).json({ error: e, message: "Could not delete items from cart" }))
	})
	.catch((e) => res.json({ error: e, message: "Could not find Cart items" }))
})

// 6 GET BOOKINGS /bookings --> renvoie les trajets achetés (booking)
router.get('/bookings', (req, res) => {
	Booking.find()
	.populate('trip')
	.then((bookings) => {
		if (bookings.length > 0) {
			return res.status(200).json({ result: true, bookings })
		} else {
			return res.status(200).json({ result: false, message: "No bookings found" })
		}
	})
	.catch((e) => res.status(500).json({ error: e, message: "Could not find bookings" }))
})

module.exports = router;