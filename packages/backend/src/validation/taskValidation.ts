
import Joi from 'joi';

const taskSchema = {
  create: Joi.object({
    title: Joi.string().min(1).max(100).required(),
    description: Joi.string().max(500).allow('').optional(),
    dueDate: Joi.date().iso().optional().allow(null),
    priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').optional(),
    status: Joi.string().valid('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED').optional(),
    contactId: Joi.string().cuid().optional().allow(null),
  }),
  update: Joi.object({
    title: Joi.string().min(1).max(100).optional(),
    description: Joi.string().max(500).allow('').optional(),
    dueDate: Joi.date().iso().optional().allow(null),
    priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').optional(),
    status: Joi.string().valid('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED').optional(),
    contactId: Joi.string().cuid().optional().allow(null),
    completedAt: Joi.date().iso().optional().allow(null),
  }),
};

export default taskSchema;
