// utils/paymobService.js
import axios from "axios";

const PAYMOB_SECRET_KEY = process.env.PAYMOB_SECRET_KEY; // v2 secret key

const createPaymobintention = async (order) => {
  if (!PAYMOB_SECRET_KEY) throw new Error("PAYMOB_SECRET_KEY is missing from env");

  try {
    const res = await axios.post(
      "https://accept.paymob.com/v1/intention/",
      {
        amount:           Math.round(order.totalPrice * 100),
        currency:         "EGP",
        payment_methods:  [Number(process.env.PAYMOB_INTEGRATION_ID)],
        items: order.items.map((item) => ({
          name:        item.title,
          amount:      Math.round(item.price * 100),
          description: item.title,
          quantity:    item.quantity,
        })),
        billing_data: {
          first_name:   order.shippingAddress.firstName,
          last_name:    order.shippingAddress.lastName,
          email:        order.shippingAddress.email,
          phone_number: order.shippingAddress.phone,
          apartment:    "NA",
          floor:        "NA",
          street:       order.shippingAddress.address,
          building:     "NA",
          postal_code:  "NA",
          city:         order.shippingAddress.city,
          country:      order.shippingAddress.country,
          state:        "NA",
        },
        customer: {
          first_name:   order.shippingAddress.firstName,
          last_name:    order.shippingAddress.lastName,
          email:        order.shippingAddress.email,
        },
        metadata: {
          order_id:          order._id.toString(),
          merchant_order_id: order.merchantOrderId,
        },
      },
      {
        headers: {
          Authorization: `Token ${PAYMOB_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.data.client_secret;

  } catch (err) {
    const details = err.response?.data || err.message;
    console.error("[Paymob v2] FAILED:", JSON.stringify(details, null, 2));
    throw new Error(`Paymob intention failed: ${JSON.stringify(details)}`);
  }
};

export { createPaymobintention };