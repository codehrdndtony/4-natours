const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');
const app = express();

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const bookingController = require('./controllers/bookingController');
const viewRouter = require('./routes/viewRoutes');

app.enable('trust proxy');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES
// Implement CORS
app.use(cors());
// Access-Control-Allow-Origin *
// api.natours.com, front-end natours.com
// app.use(cors({
//   origin: 'https://www.natours.com'
// }));

//app.options('*', cors());
// app.options('/api/v1/tours/:id', cors())

// Serving static files app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

// Security HTTP headers

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// Development logging
console.log(`CURRENT ENV >> ${process.env.NODE_ENV} <<`);
if(process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour'
});
app.use('/api', limiter);

app.post(
  '/webhook-checkout',
  express.json({ type: 'application/json' }),
  bookingController.webhookCheckout);

// Body parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded( { extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
  whitelist: [
    'duration',
    'ratingsQuantity',
    'ratingsAverage',
    'maxGroupSize',
    'difficulty',
    'price'
    ]
  })
);

app.use(compression());

// app.use(function (req, res, next) {
//   res.setHeader(
//     "Content-Security-Policy",
//     "font-src 'self'  https://fonts.gstatic.com ; script-src 'self' https://cdnjs.cloudflare.com https://js.stripe.com/v3/ https://api.mapbox.com; style-src 'self' https://fonts.googleapis.com/css https://api.mapbox.com blob: 'unsafe-inline'; frame-src 'self' https://js.stripe.com; worker-src 'self' blob:;"
//   );
//   next();
// });

// TEST middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  //console.log(req.headers); - used to debug authorization header
  next();
});

// 3) ROUTES

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  // const err = new Error(`Can't find ${req.originalUrl} on this server`);
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
