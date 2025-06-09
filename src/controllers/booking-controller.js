const { SuccessResponse, ErrorResponse } = require('../utils/common');
const { BookingService } = require('../services');
const { StatusCodes } = require('http-status-codes');

const createBooking = async (req, res) => {
    try {
        const booking = await BookingService.createBooking({
            flightId: req.body.flightId,
            userId: req.body.userId,
            noOfSeats: req.body.noOfSeats
        });
        
        SuccessResponse.data = booking;
        SuccessResponse.message = "Booking created successfully";
        return res.status(StatusCodes.CREATED).json(SuccessResponse);
    } catch (error) {
        console.error('Booking creation error:', error); 
        ErrorResponse.error = error;
        ErrorResponse.message = error.message || 'Something went wrong';
        const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
        return res.status(statusCode).json(ErrorResponse);
    }
}

const makePayment = async (req,res) => {
    try {
        const response = await BookingService.makePayment({
            bookingId : req.body.bookingId,
            userId : req.body.userId,
            totalCost : req.body.totalCost
        })
        SuccessResponse.data = response;
        SuccessResponse.message = "Payment made successfully"
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error
        return res.status(error.statusCode).json(ErrorResponse);
    }
}

module.exports = {
    createBooking,
    makePayment
}