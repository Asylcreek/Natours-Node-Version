const catchAsync = require('../Utils/catchAsync');
const AppError = require('../Utils/appError');
const APIFeatures = require('../Utils/apiFeatures');

exports.getAll = (Model) =>
    catchAsync(async(req, res, next) => {
        //To allow for nested get reviews on tour
        let filter;
        if (req.params.tourId) filter = { tour: req.params.tourId };

        //Execute query
        const features = new APIFeatures(Model.find(filter), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate();

        const document = await features.query;

        //Send the response
        res.status(200).send({
            status: 'success',
            results: document.length,
            data: {
                data: document,
            },
        });
    });

exports.getOne = (Model, populateOptions) =>
    catchAsync(async(req, res, next) => {
        //Get id from request
        const { id } = req.params;

        // Define query
        let query = Model.findById(id);
        if (populateOptions) query = query.populate(populateOptions);

        //Await query and save result to document
        const document = await query;

        //Check if document exists
        if (!document) {
            return next(new AppError('No document found with that id', 404));
        }

        res.status(200).send({
            status: 'success',
            data: {
                data: document,
            },
        });
    });

exports.createOne = (Model) =>
    catchAsync(async(req, res, next) => {
        //Create document
        const document = await Model.create(req.body);

        res.status(201).json({
            status: 'success',
            data: {
                data: document,
            },
        });
    });

exports.updateOne = (Model) =>
    catchAsync(async(req, res, next) => {
        //Get id from request
        const { id } = req.params;

        //Find document and update
        const document = await Model.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });

        //Check if document exists
        if (!document) {
            return next(new AppError('No document found with that id', 404));
        }

        res.status(200).json({
            status: 'success',
            data: {
                data: document,
            },
        });
    });

exports.deleteOne = (Model) =>
    catchAsync(async(req, res, next) => {
        //Get id from request
        const { id } = req.params;

        //Find and delete document
        const document = await Model.findByIdAndDelete(id);

        // Check if document exists
        if (!document) {
            return next(new AppError('No document found with that id', 404));
        }

        res.status(204).json({
            status: 'success',
            data: null,
        });
    });