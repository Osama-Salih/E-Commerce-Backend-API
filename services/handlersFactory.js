const asyncHandler = require('express-async-handler');
const ApiFeatures = require('../utils/apiFeatures');
const ApiError = require('../utils/ApiError');

exports.getAll = (Modle, modleName = '') =>
  asyncHandler(async (req, res) => {
    let filter = {};
    if (req.filterObj) {
      filter = req.filterObj;
    }
    // 1) Build query
    const countDocuments = await Modle.countDocuments();
    const apiFeatures = new ApiFeatures(req.query, Modle.find(filter))
      .filter()
      .sort()
      .limitFields()
      .search(modleName)
      .paginat(countDocuments);

    // Execute query
    const { mongooseQuery, paginationResults } = apiFeatures;

    const documents = await mongooseQuery;
    res.status(200).json({
      status: 'success',
      results: documents.length,
      paginationResults,
      data: {
        documents,
      },
    });
  });

exports.getOne = (Modle, populateOpt) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    // Build query
    let query = Modle.findById(id);
    if (populateOpt) {
      query = query.populate(populateOpt);
    }

    // Execute query
    const document = await query;
    if (!document) {
      return next(new ApiError(`No document for this id ${id}`, 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        document,
      },
    });
  });

exports.createOne = (Modle) =>
  asyncHandler(async (req, res) => {
    const newDocument = await Modle.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        newDocument,
      },
    });
  });

exports.updateOne = (Modle) =>
  asyncHandler(async (req, res, next) => {
    const document = await Modle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!document) {
      return next(
        new ApiError(`No document for this id ${req.params.id}`, 404),
      );
    }

    // Trigger save event when update document
    await document.save();

    res.status(200).json({
      status: 'success',
      data: {
        document,
      },
    });
  });

exports.deleteOne = (Modle) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await Modle.findByIdAndDelete(id);

    if (!document) {
      return next(new ApiError(`No document for this id ${id}`, 404));
    }
    // Trigger remove event when remove document
    await document.remove();

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
