const { StatusCodes } = require('http-status-codes');
const { ErrorResponse } = require('../utils/common');

const validateBookingRequest = (req, res, next) => {
  try {
    const { flightId, userId, noOfSeats } = req.body;

    if (!flightId) {
      ErrorResponse.message = "Missing required field: flightId";
      return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    if (!userId) {
      ErrorResponse.message = "Missing required field: userId";
      return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    if (
      noOfSeats === undefined ||
      noOfSeats === null ||
      isNaN(noOfSeats) ||
      parseInt(noOfSeats) <= 0
    ) {
      ErrorResponse.message = "Invalid or missing field: noOfSeats";
      return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    next(); // Proceed to controller if validation passes
  } catch (error) {
    ErrorResponse.error = error;
    ErrorResponse.message = "Validation error occurred";
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
};

const validatePaymentRequest = (req, res, next) => {
  try {
    const { bookingId, userId, totalCost } = req.body;

    if (!bookingId) {
      ErrorResponse.message = 'Missing required field: bookingId';
      return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    if (!userId) {
      ErrorResponse.message = 'Missing required field: userId';
      return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    if (
      totalCost === undefined ||
      totalCost === null ||
      isNaN(totalCost) ||
      parseFloat(totalCost) <= 0
    ) {
      ErrorResponse.message = 'Invalid or missing field: totalCost';
      return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    next();
  } catch (err) {
    ErrorResponse.error = err;
    ErrorResponse.message = 'Validation error occurred';
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse);
  }
};

module.exports = {
  validateBookingRequest,
  validatePaymentRequest
};
