import Order from "../models/order.js";
import User from "../models/users.js";
import { asyncWrapper } from "../middleware/asyncWrapper.js";
import AppError from "../utils/appError.js";
import { httpStatusText } from "../utils/httpStatusText.js";

const createMerchantOrderId = () => {
  return `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
};

const createOrder = asyncWrapper(async (req, res, next) => {
  const userId = req.currentUser.id;
  const { addressId, notes } = req.body;

  if (!addressId) {
    const error = new AppError();
    error.create('Address id is required', 400, httpStatusText.FAIL);
    return next(error);
  }

  const user = await User.findById(userId).populate('inCartProducts.product');

  if (!user) {
    const error = new AppError();
    error.create('User not found', 404, httpStatusText.FAIL);
    return next(error);
  }

  if (!user.inCartProducts || user.inCartProducts.length === 0) {
    const error = new AppError();
    error.create('Cart is empty', 400, httpStatusText.FAIL);
    return next(error);
  }

  const invalidCartItem = user.inCartProducts.find((item) => !item.product);

  if (invalidCartItem) {
    const error = new AppError();
    error.create('Some cart products no longer exist', 400, httpStatusText.FAIL);
    return next(error);
  }

  const selectedAddress = user.addresses.id(addressId);

  if (!selectedAddress) {
    const error = new AppError();
    error.create('Address not found', 404, httpStatusText.FAIL);
    return next(error);
  }

  const items = user.inCartProducts.map((item) => {
    const product = item.product;

    return {
      product: product._id,
      title: product.title,
      image: product.images?.[0] || '',
      price: product.price,
      quantity: item.quantity,
      itemSubtotal: Number((product.price * item.quantity).toFixed(2))
    };
  });

  const subtotal = Number(items.reduce((acc, item) => acc + item.itemSubtotal, 0).toFixed(2));
  
  const deliveryFee = 30;
  const discount = 0;
  const totalPrice = Number((subtotal + deliveryFee - discount).toFixed(2));

  const order = await Order.create({
    user: user._id,
    items,
    shippingAddress: {
      addressId: selectedAddress._id,
      title: selectedAddress.title,
      firstName: selectedAddress.firstName,
      lastName: selectedAddress.lastName,
      email: user.email,
      phone: selectedAddress.phone,
      address: selectedAddress.address,
      city: selectedAddress.city,
      country: selectedAddress.country
    },
    notes: notes || '',
    subtotal,
    discount,
    deliveryFee,
    totalPrice,
    paymentMethod: 'paymob',
    paymentStatus: 'pending',
    orderStatus: 'pending',
    merchantOrderId: createMerchantOrderId()
  });

  // return res.status(201).json({ status: httpStatusText.SUCCESS, data: { order } });
  return res.status(201).json({ status: httpStatusText.SUCCESS,
    data: {
      orderId: order._id,
      merchantOrderId: order.merchantOrderId,
      totalPrice: order.totalPrice,
      paymentStatus: order.paymentStatus,
      order
    }
  });
});

const getMyOrders = asyncWrapper(async (req, res, next) => {
  const userId = req.currentUser.id;
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  const skip = (page - 1) * limit;
  const orders = await Order.find({ user: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit);
  return res.status(200).json({ status: httpStatusText.SUCCESS, data: { orders } });
});

const getOrderById = asyncWrapper(async (req, res, next) => {
  const orderId = req.params.orderId;
  const userId = req.currentUser.id;

  const order = await Order.findOne({ _id: orderId, user: userId }).populate("items.product", "title imageCover price");

  if (!order) {
    const error = new AppError();
    error.create("Order not found", 404, httpStatusText.FAIL);
    return next(error);
  }

  return res.status(200).json({ status: httpStatusText.SUCCESS, data: { order } });
});

const getAllOrders = asyncWrapper(async (req, res) => {

  const orders = await Order.find()
    .populate("user", "firstName lastName email")
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    results: orders.length,
    data: { orders }
  });
});


export { createOrder, getMyOrders, getOrderById, getAllOrders };