const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Coupon name required'],
      trim: true,
      unique: true,
    },

    expire: {
      type: Date,
      required: [true, 'Coupon expiration date required'],
    },

    discount: {
      type: Number,
      required: [true, 'Coupon discount value required'],
    },
  },
  { timestamps: true },
);

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
