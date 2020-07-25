const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('./Utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./Routes/tourRoutes');
const userRouter = require('./Routes/userRoutes');
const reviewRouter = require('./Routes/reviewRoutes');
const bookingRouter = require('./Routes/bookingRoutes');
const viewRouter = require('./Routes/viewRoutes');

//initialize express
const app = express();

//View Engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

/////////Global Middlewares
//Serving static files
app.use(express.static(path.join(__dirname, 'public')));

//Set Security HTTP Headers
app.use(helmet());

//Dev logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

//To limit the amount of requests from a particular IP
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP. Please try again in an hour',
});

app.use('/api', limiter);

//Reading data from the body into req.body. The limit option manages how large the data can be
app.use(express.json({ limit: '10kb' }));

//Cookie Parser
app.use(cookieParser());

//Data sanitization against NoSQL injection
app.use(mongoSanitize());

//Data sanitization against XSS
app.use(xss());

//Prevent parameter pollution
app.use(
    hpp({
        whitelist: [
            'duration',
            'ratingsAverage',
            'ratingsQuantity',
            'maxGroupSize',
            'difficulty',
            'price',
        ],
    })
);

//Test middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

// app.use(tourController.checkBody());

//Mounted Routers

//API Routes
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

//To catch all unhandled routes (It has to be the last middleware or at least just after the predefined routers)
app.all('*', (req, res, next) => {
    next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;