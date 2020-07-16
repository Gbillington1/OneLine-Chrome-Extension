require('dotenv').config();
const express = require("express");
const app = express();
const { resolve } = require("path");
// This is your real test secret API key.
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_API_KEY);

console.log(process.env)

app.use(express.static("."));
app.use(express.json());

const calculateOrderAmount = items => {
  // 5 dollars (500 cents)
  return 500;
};

app.post("/create-payment-intent", async (req, res) => {
  const { items } = req.body;
  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculateOrderAmount(items),
    currency: "usd"
  });

  res.send({
    clientSecret: paymentIntent.client_secret
  });
});

app.listen(4242, () => console.log('Node server listening on port http://localhost:4242'));
