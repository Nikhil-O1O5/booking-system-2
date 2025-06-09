const  CrudRepository  = require('./crud-repository')
const { Booking } = require('../models');
const { AppError } = require('../utils/errors');
const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize')
const { Enums } = require('../utils/common');
const { CANCELLED, BOOKED } = Enums.BOOKING_STATUS; 

class BookingRepository extends CrudRepository {
    constructor(){
        super(Booking)
    }
    async createBooking(data, transaction){
        try {
            const response = await Booking.create(data,{transaction: transaction})
            return response
        } catch (error) {
            throw error;
        }
    }
    async getBookingDetails(data, transaction){
        try {
            const response = await Booking.findByPk(data, {transaction:transaction});
            if(!response){
                throw new AppError('Not able to find the Booking',StatusCodes.NOT_FOUND)
            }
            return response;
        } catch (error) {
            throw error;
        }
    }
    async updateBooking(id,data,transaction){
        try {
            const response = await Booking.update(data,{
                where:{
                    id : id
                }
            },{
                transaction : transaction
            });
        return response;
        } catch (error) {
            throw error;
        }
    }

    async cancelOldBookings(timestamp) {
        try {
            const response = await Booking.update({status: CANCELLED},{
                where: {
                    [Op.and] : [
                        {
                            createdAt: {
                                [Op.lt]: timestamp
                            }
                        },{
                            status : {
                                [Op.ne] : BOOKED
                            }
                        },{
                            [Op.ne] : CANCELLED
                        }
                    ]
                }
            });
            return response;
        } catch (error) {
            throw error;
        }
    }

}

module.exports = 
    BookingRepository