// controllers/paymobController.js

import Order from "../models/order.js";
import { asyncWrapper } from "../middleware/asyncWrapper.js";
import AppError from "../utils/appError.js";
import { httpStatusText } from "../utils/httpStatusText.js";
import { getAuthToken, registerPaymobOrder, getPaymentKey } from "../utils/paymobService.js";
import crypto from "crypto";

const initiatePayment = asyncWrapper(async (req, res, next) => {
  const { orderId } = req.body;
  const userId = req.currentUser.id;

  // Log incoming request
  console.log("[Pay] orderId received:", orderId);
  console.log("[Pay] userId:", userId);

  if (!orderId) {
    const error = new AppError();
    error.create("orderId is required", 400, httpStatusText.FAIL);
    return next(error);
  }

  const order = await Order.findOne({ _id: orderId, user: userId });

  if (!order) {
    console.log("[Pay] Order not found for:", orderId);
    const error = new AppError();
    error.create("Order not found", 404, httpStatusText.FAIL);
    return next(error);
  }

  if (order.paymentStatus === "paid") {
    const error = new AppError();
    error.create("Order is already paid", 400, httpStatusText.FAIL);
    return next(error);
  }

  console.log("[Pay] Starting Paymob flow for order:", order.merchantOrderId);

  // Paymob 3-step flow
  const authToken     = await getAuthToken();
  console.log("[Pay] Got auth token");

  const paymobOrderId = await registerPaymobOrder(authToken, order);
  console.log("[Pay] Registered Paymob order:", paymobOrderId);

  const paymentKey    = await getPaymentKey(authToken, paymobOrderId, order);
  console.log("[Pay] Got payment key");

  // Save paymobOrderId
  order.paymobOrderId = String(paymobOrderId);
  await order.save();

  // Hosted payment page URL
  const redirectUrl = `https://accept.paymob.com/api/acceptance/iframes/${paymobOrderId}?payment_token=${paymentKey}`;

  console.log("[Pay] Redirect URL ready");

  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { paymentKey, redirectUrl, paymobOrderId },
  });
});

const handleWebhook = asyncWrapper(async (req, res, next) => {
  const hmacSecret    = process.env.PAYMOB_HMAC_SECRET;
  const receivedHmac  = req.query.hmac;

  const obj = req.body.obj;

  // HMAC verification
  const hmacString = [
    obj.amount_cents,
    obj.created_at,
    obj.currency,
    obj.error_occured,
    obj.has_parent_transaction,
    obj.id,
    obj.integration_id,
    obj.is_3d_secure,
    obj.is_auth,
    obj.is_capture,
    obj.is_refunded,
    obj.is_standalone_payment,
    obj.is_voided,
    obj.order?.id,
    obj.owner,
    obj.pending,
    obj.source_data?.pan,
    obj.source_data?.sub_type,
    obj.source_data?.type,
    obj.success,
  ].join("");

  const calculatedHmac = crypto
    .createHmac("sha512", hmacSecret)
    .update(hmacString)
    .digest("hex");

  if (calculatedHmac !== receivedHmac) {
    console.error("[Webhook] Invalid HMAC — possible spoofing attempt");
    return res.status(401).json({ message: "Invalid HMAC" });
  }

  const { success, order: paymobOrder, id: transactionId } = obj;
  const merchantOrderId = paymobOrder?.merchant_order_id;

  console.log("[Webhook] merchantOrderId:", merchantOrderId, "| success:", success);

  const order = await Order.findOne({ merchantOrderId });
  if (!order) {
    console.error("[Webhook] Order not found:", merchantOrderId);
    return res.status(404).json({ message: "Order not found" });
  }

  if (success === true) {
    order.paymentStatus       = "paid";
    order.isPaid              = true;
    order.paidAt              = new Date();
    order.orderStatus         = "confirmed";
    order.paymobTransactionId = String(transactionId);
    console.log("[Webhook] Payment confirmed for order:", merchantOrderId);
  } else {
    order.paymentStatus = "failed";
    console.log("[Webhook] Payment failed for order:", merchantOrderId);
  }

  await order.save();
  return res.status(200).json({ status: "received" });
});

export { initiatePayment, handleWebhook };