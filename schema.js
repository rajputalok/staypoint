const Joi = require("joi");
const { join } = require("path");

const listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.alternatives().try(
            Joi.string(),
            Joi.allow(""),
            Joi.allow(null)
        ),
        latitude: Joi.number().required(), 
        longitude: Joi.number().required(),

    }).required(),
});

const reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required()
    }).required(),
});

module.exports = {listingSchema, reviewSchema};