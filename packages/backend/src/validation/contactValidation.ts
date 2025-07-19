
import Joi from 'joi';

const contactSchema = {
  create: Joi.object({
    firstName: Joi.string().min(1).max(50).required(),
    lastName: Joi.string().max(50).allow('').optional(),
    email: Joi.string().email().optional().allow(null),
    phone: Joi.string().max(20).allow('').optional(),
    company: Joi.string().max(100).allow('').optional(),
    jobTitle: Joi.string().max(100).allow('').optional(),
    address: Joi.string().max(255).allow('').optional(),
    city: Joi.string().max(50).allow('').optional(),
    state: Joi.string().max(50).allow('').optional(),
    zipCode: Joi.string().max(20).allow('').optional(),
    country: Joi.string().max(50).allow('').optional(),
    website: Joi.string().uri().optional().allow(null),
    linkedInUrl: Joi.string().uri().optional().allow(null),
    avatarUrl: Joi.string().uri().optional().allow(null),
    tags: Joi.array().items(Joi.string()).optional(),
  }),
  update: Joi.object({
    firstName: Joi.string().min(1).max(50).optional(),
    lastName: Joi.string().max(50).allow('').optional(),
    email: Joi.string().email().optional().allow(null),
    phone: Joi.string().max(20).allow('').optional(),
    company: Joi.string().max(100).allow('').optional(),
    jobTitle: Joi.string().max(100).allow('').optional(),
    address: Joi.string().max(255).allow('').optional(),
    city: Joi.string().max(50).allow('').optional(),
    state: Joi.string().max(50).allow('').optional(),
    zipCode: Joi.string().max(20).allow('').optional(),
    country: Joi.string().max(50).allow('').optional(),
    website: Joi.string().uri().optional().allow(null),
    linkedInUrl: Joi.string().uri().optional().allow(null),
    avatarUrl: Joi.string().uri().optional().allow(null),
    tags: Joi.array().items(Joi.string()).optional(),
  }),
};

export default contactSchema;
