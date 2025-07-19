
import { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  errors?: any[];
}

const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong';

  // Handle validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message || 'Validation error';
  }

  // Log the error for debugging purposes
  console.error(err);

  res.status(statusCode).json({
    status: 'error',
    message,
  });
};

export default errorHandler;
