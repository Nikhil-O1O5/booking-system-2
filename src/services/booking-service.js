// services/bookingService.js

const axios = require('axios');
const db = require('../models');
const { AppError } = require('../utils/errors');
const { StatusCodes } = require('http-status-codes');
const { ServerConfig } = require('../config')
const { BookingRepository } = require('../repositories')
const { Enums } = require('../utils/common');
const { BOOKED, CANCELLED } = Enums.BOOKING_STATUS; 

const bookingRepository = new BookingRepository();

async function createBooking(data){
    try {
        const result = await db.sequelize.transaction(async function bookingImpl(transaction) {
            // Get flight details
            const flight = await axios.get(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flight/${data.flightId}`);
            const FlightData = flight.data.data;
            
            // Check seat availability
            if(data.noOfSeats > FlightData.totalSeats){
                throw new AppError('Not enough seats available', StatusCodes.BAD_REQUEST);
            }
            
            // Calculate total cost
            const totalBillingAmount = data.noOfSeats * FlightData.price;
            const bookingPayload = {...data, totalCost: totalBillingAmount};
            
            // Create booking record
            const booking = await bookingRepository.createBooking(bookingPayload, transaction);
            
            // Update flight seats
            try {
                await axios.patch(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flight/${data.flightId}/seats`, {
                    seats: data.noOfSeats,
                    dec: true  // or dec: 1, depending on what the API expects
                });
            } catch (axiosError) {
                console.error('Flight service error:', axiosError.response?.data || axiosError.message);
                throw new AppError(
                    `Failed to update flight seats: ${axiosError.response?.data?.message || axiosError.message}`, 
                    StatusCodes.BAD_REQUEST
                );
            }
            
            return booking;
        });
        
        return result;
    } catch (error) {
        throw error;
    }
}

async function makePayment(data) {
    const transaction = await db.sequelize.transaction();
    try {
        const bookingDetails = await bookingRepository.getBookingDetails(data.bookingId, transaction);
        if(bookingDetails.status == CANCELLED){
            throw new AppError("The booking has expired",StatusCodes.BAD_REQUEST);
        }
        const bookingTime = new Date(bookingDetails.createdAt);
        const currentTime = new Date();
        if(currentTime - bookingTime > 300000){
            await cancelBooking(data.bookingId);
            throw new AppError("The booking has expired",StatusCodes.BAD_REQUEST);
        }
        if(bookingDetails.totalCost != data.totalCost){
            throw new AppError("The amount of payment doesn't match",StatusCodes.BAD_REQUEST);
        }
        if(bookingDetails.userId != data.userId){
            throw new AppError("The user corresponding to the booking doesn't match", StatusCodes.BAD_REQUEST);
        }
        const response = await bookingRepository.updateBooking(data.bookingId, {status : BOOKED}, transaction);
        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        throw error();
    }
}

async function cancelBooking(bookingId) {
    const transaction = await db.sequelize.transaction();
    try {
        const bookingDetail = await bookingRepository.getBookingDetails(bookingId, transaction);
        if(bookingDetail.status == CANCELLED){
            await transaction.commit();
            return true;
        }
        await axios.patch(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flight/${flightId}/seats`, {
                    seats: bookingDetail.noOfSeats,
                    dec: false});
        await bookingRepository.update(bookingId,{status : CANCELLED}, transaction );
        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

async function cancelOldBookings() {
    try {
        const cutOffTime = new Date(Date.now() - 5*60*1000);
        const response = await bookingRepository.cancelOldBookings(cutOffTime);
        return response;
    } catch (error) {
        throw error;
    }
}

module.exports = { 
    createBooking,
    makePayment,
    cancelOldBookings
 }; 