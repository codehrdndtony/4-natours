const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDublicateFieldsDB = (err) => {
  const value = err.message.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Dublicate field value: ${value}. Please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () => new AppError('Invalid token. Please log-in again!', 401);

const handleJWTExpiredError = () => new AppError('Your token has expired! Please log in again', 401);

const sendErrorDev = (err, req, res) => {
  // Splitting for API and rendered web-site
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }

  // B) RENDERED WEBSITE
  console.error('ERROR !!', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message
  });
};

const sendErrorProd = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }
    // Programming or other unknown error: don't leak error details to a client
    // 1) Log error
    console.error('ERROR !!', err);

    // 2) Send generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong! (Generic message)'
    });
  }
  // B) RENDERED WEBSITE
  // a) operational, trusted error: send message to a client
  if (err.isOperational) {
    console.log(err.message);
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message
    });
  }
  // b) Programming or other unknown error: don't leak error details to a client
  // 1) Log error
  console.error('ERROR !!', err);
  // 2) Send generic message
  return res.status(500).json({
    title: 'Something went wrong!',
    msg: 'Please, try again later! (Generic message)'
  });
};

module.exports = (err, req, res, next) => {
  //console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  switch (process.env.NODE_ENV) {
    case 'development':
      sendErrorDev(err, req, res);
      break;
    case 'production':
      let error = err;

      if (error.name === 'CastError') error = handleCastErrorDB(error); // TODO - Deep debug is interesting with 'error' param
      if (error.code === 11000) error = handleDublicateFieldsDB(error);
      if (error.name === 'ValidationError')
        error = handleValidationErrorDB(error);
      if (error.name === 'JsonWebTokenError') error = handleJWTError();
      if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

      console.log(err.message);
      console.log(error.message);

      sendErrorProd(error, req, res);
      break;
  }

  // if(process.env.NODE_ENV === 'development') {
  //
  // } else if (process.env.NODE_ENV === 'production'){
  //
  // }
};
