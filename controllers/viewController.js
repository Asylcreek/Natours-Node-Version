const Tour = require('../models/tourModel');
const catchAsync = require('../Utils/catchAsync');
const AppError = require('../Utils/appError');

exports.getOverview = catchAsync(async(req, res, next) => {
    //Get Tour data from collection
    const tours = await Tour.find();

    //Render Template
    res.status(200).render('overview', { title: 'All Tours', tours });
});

exports.getTour = catchAsync(async(req, res, next) => {
    const { slug } = req.params;

    const tour = await Tour.findOne({ slug }).populate({
        path: 'reviews',
        select: 'review rating user -tour',
    });

    if (!tour) return next(new AppError('There is no tour with that name', 404));

    //Render Template
    res.status(200).render('tour', { tour, title: `${tour.name} Tour` });
});

exports.getLoginForm = (req, res) => {
    res.status(200).render('login', { title: 'Log into your account' });
};