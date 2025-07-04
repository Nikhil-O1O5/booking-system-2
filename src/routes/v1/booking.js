const { BookingController } = require('../../controllers');
const { BookingMiddleware } = require('../../middlewares');
const express = require('express');

const router = express.Router();

router.post('/',BookingMiddleware.validateBookingRequest, BookingController.createBooking);
router.post('/payment',BookingMiddleware.validatePaymentRequest, BookingController.makePayment);

module.exports = router;