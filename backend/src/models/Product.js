const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [150, 'Product name cannot exceed 150 characters'],
    },
    styleId: {
      type: String,
      required: [true, 'Style ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'All',
        'Topwear',
        'Bottomwear',
        'Dresses',
        'Jackets',
        'Shirts',
        'Accessories',
        'Footwear',
        'Outerwear',
      ],
      index: true,
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: '' },
        isPrimary: { type: Boolean, default: false },
      },
    ],
    brand: {
      type: String,
      required: [true, 'Brand name is required'],
      trim: true,
    },
    size: {
      type: String,
      trim: true,
      default: 'M',
    },
    color: {
      type: String,
      trim: true,
      default: 'Black',
    },
    condition: {
      type: String,
      enum: ['Brand New', 'Like New', 'Pristine Archive', 'Vintage Excellent'],
      default: 'Brand New',
    },
    startingPrice: {
      type: Number,
      required: [true, 'Starting price is required'],
      min: [0, 'Starting price cannot be negative'],
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
