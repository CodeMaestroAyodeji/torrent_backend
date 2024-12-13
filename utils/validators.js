// utils/validators.js

const Joi = require('joi');

const validatePlan = (plan) => {
    const schema = Joi.string().valid('premium', 'free').required();
    return schema.validate(plan);
};

module.exports = { validatePlan };
