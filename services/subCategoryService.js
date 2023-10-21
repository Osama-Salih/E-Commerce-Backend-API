const SubCategory = require('../models/subCategoryModule');
const factory = require('./handlersFactory');

// Nested route
// 127.0.0.1:8000/api/v1/categories/65118278fb92355067884119/subcategories
exports.createFilterObject = (req, res, next) => {
  let filterObject = {};
  if (req.params.categoryId) filterObject = { category: req.params.categoryId };
  req.filterObj = filterObject;
  next();
};
// @doc     Get list of subcategories
// @route   GET /api/v1/subcategories
// @access  Public
// Nested route (create)
exports.getSubCategories = factory.getAll(SubCategory);

// @doc     Get specific subCategory by id
// @route   GET /api/v1/subcategories/:id
// @access  Public
exports.getSubCategory = factory.getOne(SubCategory);

exports.setCategoryIdToBody = (req, res, next) => {
  // nested route
  if (!req.body.category) req.body.category = req.params.categoryId;
  next();
};

// @doc    create SubCategory
// @route  POST /api/v1/subcategories
// @access Private/admin-manager
exports.createSubCategory = factory.createOne(SubCategory);

// @doc     Update specific subCategory by id
// @route   PUT /api/v1/subcategories/:id
// @access  Private/admin-manager
exports.updateSubCategory = factory.updateOne(SubCategory);

// @doc     Delete specific subCategory by id
// @route   Delete /api/v1/subcategories/:id
// @access  Private-Admin
exports.deleteCategory = factory.deleteOne(SubCategory);
