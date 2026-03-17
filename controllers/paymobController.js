// controllers/paymobController.js
import Order from "../models/order.js";
import { asyncWrapper } from "../middleware/asyncWrapper.js";
import AppError from "../utils/appError.js";
import { httpStatusText } from "../utils/httpStatusText.js";
import { getAuthToken, registerPaymobOrder, getPaymentKey, PAYMOB_IFRAME_ID } from "../utils/paymobService.js";
import crypto from "crypto";

// POST /api/paymob/pay
const initiatePayment = asyncWrapper(async (req, res, next) => {
  const { orderId } = req.body;
  const userId = req.currentUser.id;

  console.log("[Pay] orderId:", orderId, "| userId:", userId);

  if (!orderId) {
    const error = new AppError();
    error.create("orderId is required", 400, httpStatusText.FAIL);
    return next(error);
  }

  if (!PAYMOB_IFRAME_ID) {
    console.error("[Pay] PAYMOB_IFRAME_ID is missing from env");
    const error = new AppError();
    error.create("Payment configuration error", 500, httpStatusText.ERROR);
    return next(error);
  }

  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) {
    const error = new AppError();
    error.create("Order not found", 404, httpStatusText.FAIL);
    return next(error);
  }

  if (order.paymentStatus === "paid") {
    const error = new AppError();
    error.create("Order is already paid", 400, httpStatusText.FAIL);
    return next(error);
  }

  // Paymob v1 — 3 steps
  const authToken     = await getAuthToken();
  const paymobOrderId = await registerPaymobOrder(authToken, order);
  const paymentKey    = await getPaymentKey(authToken, paymobOrderId, order);

  // Save paymobOrderId
  order.paymobOrderId = String(paymobOrderId);
  await order.save();

  const redirectUrl = `https://accept.paymob.com/api/acceptance/iframes/${PAYMOB_IFRAME_ID}?payment_token=${paymentKey}`;
  console.log("[Pay] Ready — redirecting to Paymob iframe:", redirectUrl);

  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { redirectUrl },
  });
});

// POST /api/paymob/webhook
const handleWebhook = asyncWrapper(async (req, res) => {
  const hmacSecret   = process.env.PAYMOB_HMAC_SECRET;
  const receivedHmac = req.query.hmac;
  const obj          = req.body.obj;

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
    console.error("[Webhook] Invalid HMAC");
    return res.status(401).json({ message: "Invalid HMAC" });
  }

  const { success, id: transactionId } = obj;
  const merchantOrderId = obj.order?.merchant_order_id;
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
    console.log("[Webhook] Payment confirmed:", merchantOrderId);
  } else {
    order.paymentStatus = "failed";
    console.log("[Webhook] Payment failed:", merchantOrderId);
  }

  await order.save();
  return res.status(200).json({ status: "received" });
});

export { initiatePayment, handleWebhook };