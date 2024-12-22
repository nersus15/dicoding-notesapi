const Joi = require("joi");

const ExportNotesPayloadSchema = Joi.object({
    targetEmail: Joi.string().required()
});

module.exports = ExportNotesPayloadSchema;