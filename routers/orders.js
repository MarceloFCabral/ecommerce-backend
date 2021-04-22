const express = require("express");
const router = express.Router();
const Order = require("../models/order");

router.get("/", async (req, res) => {
  try {
    const orderList = await Order.find();
    res.status(200).json(orderList);
  } catch (err) {
    res.status(500).json({ error: err, success: false });
  }
});

router.post("/", async (req, res) => {
  const order = new Order({});
  try {
    let newOrder = await order.save();
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ error: err, success: false });
  }
});

module.exports = router;
