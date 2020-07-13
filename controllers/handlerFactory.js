const catchAsync = require('../Utils/catchAsync');
const AppError = require('../Utils/appError');

exports.deleteOne = (Model) =>
    catchAsync(async(req, res, next) => {
        const { id } = req.params;

        const document = await Model.findByIdAndDelete(id);

        if (!document) {
            return next(new AppError('No document found with that id', 404));
        }

        res.status(204).json({
            status: 'success',
            data: null,
        });
    });