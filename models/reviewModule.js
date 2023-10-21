const mongoose = require('mongoose');
const Product = require('./productModule');

const reviewSchema = new mongoose.Schema(
  {
    title: String,
    ratings: {
      type: Number,
      min: [1, 'Min ratings value is 1.0'],
      max: [5, 'Max ratings value is 5.0'],
      required: [true, 'Review ratings required'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to user'],
    },
    // Parant references (One to many)
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: [true, 'Review must belong to product'],
    },
  },
  { timestamps: true },
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: 'user', select: 'name ' });
  next();
});

// Define the static method for the schema
reviewSchema.statics.calcRatingsAverageAndQuantity = async function (
  productId,
) {
  // Use aggregate to calculate ratingsAverage and ratingsQuantity
  const result = await this.aggregate([
    // Stage 1: Match reviews for the specific product
    {
      $match: { product: productId },
    },
    // Stage 2: Group reviews by productId and calculate ratingsAverage and ratingsQuantity
    {
      $group: {
        _id: 'product',
        ratingsAverage: { $avg: '$ratings' },
        ratingsQuantity: { $sum: 1 },
      },
    },
  ]);

  if (result.length > 0) {
    await Product.findByIdAndUpdate(
      productId,
      {
        ratingsAverage: result[0].ratingsAverage,
        ratingsQuantity: result[0].ratingsQuantity,
      },
      { new: true },
    );
  } else {
    await Product.findByIdAndUpdate(
      productId,
      {
        ratingsAverage: 0,
        ratingsQuantity: 0,
      },
      { new: true },
    );
  }
};

// Use a post middleware to call the static method after a review is saved
reviewSchema.post('save', async function () {
  // Call the static method with the product of the current review
  await this.constructor.calcRatingsAverageAndQuantity(this.product);
});

reviewSchema.post('remove', async function () {
  // Call the static method with the product of the current review
  await this.constructor.calcRatingsAverageAndQuantity(this.product);
});

const ReviewModel = mongoose.model('Review', reviewSchema);
module.exports = ReviewModel;
