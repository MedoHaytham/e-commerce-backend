import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    default: ""
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  itemSubtotal: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });



const shippingAddressSchema = new mongoose.Schema({
  addressId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    enum: [
      'egypt', 
      'saudi arabia', 
      'uae', 
      'qatar', 
      'american', 
      'british', 
      'yemen', 
      'syria', 
      'lebanon', 
      'jordan', 
      'palestine', 
      'iraq', 
      'morocco', 
      'algeria', 
      'tunisia', 
      'libya', 
      'sudan', 
      'somalia', 
      'djibouti', 
      'comoros'
    ],
    default: "egypt"
  }
}, { _id: false });



const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  items: {
    type: [orderItemSchema],
    required: true,
    validate: {
      validator: function(items) {
        return items && items.length > 0;
      },
      message: "Order must contain at least one item"
    }
  },

  shippingAddress: {
    type: shippingAddressSchema,
    required: true
  },

  notes: {
    type: String,
    trim: true,
    default: ""
  },

  currency: {
    type: String,
    default: "EGP"
  },

  subtotal: {
    type: Number,
    required: true,
    min: 0
  },

  discount: {
    type: Number,
    default: 0,
    min: 0
  },

  deliveryFee: {
    type: Number,
    required: true,
    min: 0,
  },

  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },

  couponCode: {
    type: String,
    default: ""
  },

  paymentMethod: {
    type: String,
    enum: ["paymob", "cash"],
    default: "paymob"
  },

  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed", "cancelled", "refunded"],
    default: "pending"
  },

  orderStatus: {
    type: String,
    enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
    default: "pending"
  },

  merchantOrderId: {
    type: String,
    required: true,
    unique: true
  },

  paymobOrderId: {
    type: String,
    default: null
  },

  paymobTransactionId: {
    type: String,
    default: null
  },

  isPaid: {
    type: Boolean,
    default: false
  },

  paidAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);

export default Order;