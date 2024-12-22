const Joi = require("joi");

const ImageHeaderSchema = Joi.object({
    'content-type': Joi.string().valid('iage/apng', 'image/avif', 'image/gif', 'image/jpeg', 'image/png').required()
}).unknown();

module.exports = {ImageHeaderSchema};