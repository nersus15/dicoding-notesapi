const InvariantError = require("../../exceptions/InvariantError");
const { ImageHeaderSchema } = require("./schema")

const UploadsValidator = {
    validateImageHeaders: (header) => {
        const result = ImageHeaderSchema.validate(header);
        if(result.error){
            throw new InvariantError(result.error.message);
        }
    } 
}

module.exports = UploadsValidator;