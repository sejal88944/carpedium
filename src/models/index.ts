import mongoose, { Schema, type Model } from 'mongoose'

function getModel<T>(name: string, schema: Schema): Model<T> {
  return (mongoose.models[name] as Model<T>) || mongoose.model<T>(name, schema)
}

const userSchema = new Schema(
  {
    email: { type: String, unique: true, required: true, lowercase: true, index: true },
    name: String,
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'admin' },
  },
  { timestamps: true },
)

const productSchema = new Schema(
  {
    slug: { type: String, unique: true, required: true },
    title: { type: String, required: true },
    description: String,
    category: { type: String, index: true },
    price: { type: Number, required: true },
    compareAt: Number,
    discount: Number,
    images: [String],
    image: String,
    surface: String,
    colors: [String],
    sizes: [String],
    stock: { type: Number, default: 0 },
    tags: [String],
    active: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true },
)

const orderSchema = new Schema(
  {
    code: { type: String, unique: true, index: true },
    items: [
      {
        slug: String,
        title: String,
        qty: Number,
        size: String,
        color: String,
        price: Number,
        designUrl: String,
      },
    ],
    total: Number,
    customer: {
      name: String,
      email: String,
      phone: String,
      address: String,
      city: String,
      pincode: String,
    },
    payment: {
      method: { type: String, enum: ['cod', 'razorpay', 'whatsapp'], default: 'cod' },
      paid: { type: Boolean, default: false },
      razorpayId: String,
    },
    status: {
      type: String,
      enum: ['confirmed', 'printing', 'quality-check', 'packed', 'shipped', 'delivered', 'cancelled'],
      default: 'confirmed',
    },
    note: String,
  },
  { timestamps: true },
)

const customerSchema = new Schema(
  {
    name: String,
    email: { type: String, unique: true, sparse: true, index: true },
    phone: String,
    city: String,
    ordersCount: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    lastOrderAt: Date,
  },
  { timestamps: true },
)

const bulkOrderSchema = new Schema(
  {
    company: String,
    contactName: String,
    email: String,
    phone: String,
    city: String,
    quantity: Number,
    printingType: String,
    logoUrl: String,
    note: String,
    status: {
      type: String,
      enum: ['new', 'quoted', 'won', 'lost'],
      default: 'new',
    },
  },
  { timestamps: true },
)

const uploadSchema = new Schema(
  {
    type: { type: String, enum: ['logo', 'image', 'text'], default: 'image' },
    label: String,
    url: String,
    customerEmail: String,
    customerName: String,
    productSlug: String,
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    note: String,
  },
  { timestamps: true },
)

const couponSchema = new Schema(
  {
    code: { type: String, unique: true, uppercase: true, index: true },
    discountType: { type: String, enum: ['percent', 'flat'], default: 'percent' },
    discountValue: Number,
    minOrder: Number,
    expiresAt: Date,
    usageLimit: Number,
    usedCount: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
)

const blogSchema = new Schema(
  {
    slug: { type: String, unique: true, index: true },
    title: String,
    excerpt: String,
    body: String,
    cover: String,
    author: String,
    category: String,
    tags: [String],
    metaTitle: String,
    metaDescription: String,
    published: { type: Boolean, default: false },
    publishedAt: Date,
  },
  { timestamps: true },
)

const reviewSchema = new Schema(
  {
    productSlug: String,
    customerName: String,
    customerEmail: String,
    rating: { type: Number, min: 1, max: 5 },
    title: String,
    body: String,
    approved: { type: Boolean, default: false },
  },
  { timestamps: true },
)

const settingSchema = new Schema(
  {
    key: { type: String, unique: true, index: true },
    value: Schema.Types.Mixed,
  },
  { timestamps: true },
)

export type UserDoc = {
  _id: string
  email: string
  name?: string
  passwordHash: string
  role: 'admin' | 'user'
}

export const User = getModel<UserDoc>('User', userSchema)
export const Product = getModel('Product', productSchema)
export const Order = getModel('Order', orderSchema)
export const Customer = getModel('Customer', customerSchema)
export const BulkOrder = getModel('BulkOrder', bulkOrderSchema)
export const Upload = getModel('Upload', uploadSchema)
export const Coupon = getModel('Coupon', couponSchema)
export const Blog = getModel('Blog', blogSchema)
export const Review = getModel('Review', reviewSchema)
export const Setting = getModel('Setting', settingSchema)
