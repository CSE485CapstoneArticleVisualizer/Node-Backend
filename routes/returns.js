const Joi = require('joi');
const validate = require('../middleware/validate');
const {Rental} = require('../models/rental');
const {Movie} = require('../models/movie');
const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();

function validateReturn(req) {
    const schema = {
        customerId: Joi.objectId().required(),
        movieId: Joi.objectId().required()
    };

    return Joi.validate(req, schema);
}

router.post('/', [auth, validate(validateReturn)], async (req, res) => {

    const rental = await Rental.lookup(req.body.customerId, req.body.movieId);

    if (!rental) return res.status(404).send('Rental not found');

    if (rental.dateReturned) return res.status(400).send('This movie has already been returned');
    
    // Information Expert Principle 
    // Return a Rental...
    rental.returnMovie();
    await rental.save();

    // Update the number of rentals
    await Movie.update({ _id: rental.movie._id }, {
        $inc: { numberInStock: 1 }
    });

    return res.send(rental);
});

// function validateReturn(req) {
//     const schema = {
//         customerId: Joi.objectId().required(),
//         movieId: Joi.objectId().required()
//     };

//     return Joi.validate(req, schema);
// }


module.exports = router;


// POST /api/returns {customerId, movieId}

// Return 401 if client is not logged in
// Return 400 if customerId is not provided
// Return 400 if movieId is not provided
// Return 404 if no rental found for this customer/movie
// Return 400 if rental already processed
// Return 200 if valid request
// Set the return date
// Calculate the rental fee
// Increase the stock of the returned movie
// Return the rental

