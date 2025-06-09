const { StatusCodes } = require('http-status-codes');
const { Logger } = require('../config');
const { AppError } = require('../utils/errors');

class CrudRepository {
    constructor(model){
        this.model = model;
    }

    async create(data) {
        try {
            const response = await this.model.create(data);
            return response
        } catch (error) {
            Logger.error(`Error occured in create method in CrudRepository: ${error.message}`);
            throw error;
        }
    }

    async delete(data) {
        try {
            const response = await this.model.destroy({
                where:{
                    id:data
                }
            })
            if(response === 0) { 
                Logger.error(`No record found with id: ${data}`);
                throw new AppError(`No record found with id: ${data}`, StatusCodes.NOT_FOUND);   
            }
            return response;
        } catch (error) {
            Logger.error(`Error occured in destroy method in CrudRepository: ${error.message}`);
            throw error;
        }
    }

    async get(data) {
        try {
            const response = await this .model.findByPk(data);
            if(!response) { 
                Logger.error(`No record found with id: ${data}`);
                throw new AppError(`No record found with id: ${data}`,StatusCodes.NOT_FOUND);
            }
            return response;
        } catch (error) {
            Logger.error(`Error occured in get method in CrudRespository: ${error.message}`);
            throw error;
        }
    }

    async getAll(){
        try {
            const response = await this.model.findAll();
            if(!response || response.length === 0) {
                Logger.error("No records found");
                throw new AppError("No records found", StatusCodes.NOT_FOUND);
            }
            return response;
        } catch (error) {
            Logger.error(`Error occured in getAll method in CrudRepository: ${error.message}`);
            throw error;
        }
    }

    async update(data, updateData) {
        try {
            const response = await this.model.update(updateData, {
                where: {
                    id: data
                }
            });
            if(response[0] === 0) {
                Logger.error(`No record found with id: ${data}`);
                throw new AppError(`No record found with id: ${data}`, StatusCodes.NOT_FOUND);
            }
            return response;
        } catch (error) {
            Logger.error(`Error occured in update method in CrudRepository: ${error.message}`);
            throw error;
        }
    }

}

module.exports = CrudRepository;