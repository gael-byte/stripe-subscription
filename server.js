require("dotenv").config();
const express = require("express");
const Stripe = require("stripe");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
function getNextFirstOfMonth() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const nextMonth = new Date(Date.UTC(year, month + 1, 1, 0, 0, 0));
  return Math.floor(nextMonth.getTime() / 1000);
}
app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      subscription_data: {
        billing_cycle_anchor: getNextFirstOfMonth(),
      },
      allow_promotion_codes: true,
      success_url: process.env.SUCCESS_URL,
      cancel_url: process.env.CANCEL_URL,
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating session");
  }
});
app.listen(3000, () => console.log("Server running on port 3000"));
