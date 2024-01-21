const joi = require('joi');

const registerSchema = (req, res) => {
   const registerValidationSchema =  joi.object({
            firstName: joi.string().required(),
            surname: joi.string().required(),
            email: joi.string().email().required(),
            phone: joi.number().required(),
            password: joi.string().required().min(7).max(15),
            referral: joi.string()
        });
        const {error} = registerValidationSchema.validate(req.body);
        if (error) return res.send(error.message);
}

module.exports = {
    registerSchema
}