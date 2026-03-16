import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const PAYMOB_API_KEY      = process.env.PAYMOB_API_KEY;
const PAYMOB_INTEGRATION_ID = Number(process.env.PAYMOB_INTEGRATION_ID);

// Step 1: Authenticate and get auth_token
const getAuthToken = async () => {
  const res = await axios.post("https://accept.paymob.com/api/auth/tokens", {
    api_key: PAYMOB_API_KEY,
  });
  return res.data.token;
};

// Step 2: Register order on Paymob
const registerPaymobOrder = async (authToken, order) => {
  const res = await axios.post(
    "https://accept.paymob.com/api/ecommerce/orders",
    {
      auth_token:     authToken,
      delivery_needed: false,
      amount_cents:   Math.round(order.totalPrice * 100), // convert to cents
      currency:       "EGP",
      merchant_order_id: order.merchantOrderId,
      items: order.items.map((item) => ({
        name:        item.title,
        amount_cents: Math.round(item.price * 100),
        description: item.title,
        quantity:    item.quantity,
      })),
    }
  );
  return res.data.id; // paymobOrderId
};

// Step 3: Generate payment key
const getPaymentKey = async (authToken, paymobOrderId, order) => {
  const res = await axios.post(
    "https://accept.paymob.com/api/acceptance/payment_keys",
    {
      auth_token:     authToken,
      amount_cents:   Math.round(order.totalPrice * 100),
      expiration:     3600,
      order_id:       paymobOrderId,
      currency:       "EGP",
      integration_id: PAYMOB_INTEGRATION_ID,
      billing_data: {
        first_name:       order.shippingAddress.firstName,
        last_name:        order.shippingAddress.lastName,
        email:            order.shippingAddress.email,
        phone_number:     order.shippingAddress.phone,
        apartment:        "NA",
        floor:            "NA",
        street:           order.shippingAddress.address,
        building:         "NA",
        shipping_method:  "NA",
        postal_code:      "NA",
        city:             order.shippingAddress.city,
        country:          order.shippingAddress.country,
        state:            "NA",
      },
    }
  );
  return res.data.token; // payment_key
};

export { getAuthToken, registerPaymobOrder, getPaymentKey };