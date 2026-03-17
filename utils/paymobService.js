// utils/paymobService.js
import axios from "axios";

const PAYMOB_API_KEY        = process.env.PAYMOB_API_KEY;
const PAYMOB_INTEGRATION_ID = Number(process.env.PAYMOB_INTEGRATION_ID);
const PAYMOB_IFRAME_ID      = process.env.PAYMOB_IFRAME_ID;

const paymobRequest = async (url, body, stepName) => {
  try {
    const res = await axios.post(url, body);
    return res.data;
  } catch (err) {
    const details = err.response?.data || err.message;
    console.error(`[Paymob] FAILED at: ${stepName}`, JSON.stringify(details, null, 2));
    throw new Error(`Paymob ${stepName} failed: ${JSON.stringify(details)}`);
  }
};

// Step 1: Auth token
const getAuthToken = async () => {
  if (!PAYMOB_API_KEY) throw new Error("PAYMOB_API_KEY is missing");
  const data = await paymobRequest(
    "https://accept.paymob.com/api/auth/tokens",
    { api_key: PAYMOB_API_KEY },
    "getAuthToken"
  );
  return data.token;
};

// Step 2: Register order
const registerPaymobOrder = async (authToken, order) => {
  const data = await paymobRequest(
    "https://accept.paymob.com/api/ecommerce/orders",
    {
      auth_token:        authToken,
      delivery_needed:   false,
      amount_cents:      Math.round(order.totalPrice * 100),
      currency:          "EGP",
      merchant_order_id: order.merchantOrderId,
      items: order.items.map((item) => ({
        name:         item.title,
        amount_cents: Math.round(item.price * 100),
        description:  item.title,
        quantity:     item.quantity,
      })),
    },
    "registerPaymobOrder"
  );
  return data.id;
};

// Step 3: Payment key
const getPaymentKey = async (authToken, paymobOrderId, order) => {
  if (!PAYMOB_INTEGRATION_ID) throw new Error("PAYMOB_INTEGRATION_ID is missing");
  const data = await paymobRequest(
    "https://accept.paymob.com/api/acceptance/payment_keys",
    {
      auth_token:     authToken,
      amount_cents:   Math.round(order.totalPrice * 100),
      expiration:     3600,
      order_id:       paymobOrderId,
      currency:       "EGP",
      integration_id: PAYMOB_INTEGRATION_ID,
      billing_data: {
        first_name:      order.shippingAddress.firstName,
        last_name:       order.shippingAddress.lastName,
        email:           order.shippingAddress.email,
        phone_number:    order.shippingAddress.phone,
        apartment:       "NA",
        floor:           "NA",
        street:          order.shippingAddress.address,
        building:        "NA",
        shipping_method: "NA",
        postal_code:     "NA",
        city:            order.shippingAddress.city,
        country:         order.shippingAddress.country,
        state:           "NA",
      },
    },
    "getPaymentKey"
  );
  return data.token;
};

export { getAuthToken, registerPaymobOrder, getPaymentKey, PAYMOB_IFRAME_ID };