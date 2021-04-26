const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Order = require("../models/order");
const OrderItem = require("../models/orderItem");
const Product = require("../models/product");

//GET all orders
router.get("/", async (req, res) => {
  try {
    const orderList = await Order.find()
      .populate("user", "name")
      .populate({
        path: "orderItems",
        populate: { path: "product", select: "price", populate: "category" },
      })
      .sort({ dateOrdered: -1 }); //ordering from newest to oldest
    if (orderList) return res.status(200).json(orderList);
    return res.status(400).json({
      message: "There has been a problem with the request",
      success: false,
    });
  } catch (err) {
    return res.status(500).json({ error: err, success: false });
  }
});

//GET order by id
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name")
      .populate({
        path: "orderItems",
        populate: { path: "product", populate: "category" },
      });
    if (order) return res.status(200).json(order);
    return res.status(404).json({
      message: "No order with the given ID was found.",
      success: false,
    });
  } catch (err) {
    return res.status(500).json({ error: err, success: false });
  }
});

//GET  count
router.get("/get/count", async (req, res) => {
  try {
    const orderCount = await Order.countDocuments((count) => count);
    if (orderCount) res.status(200).json({ orderCount, success: true });
    else
      res.status(400).json({
        message: "There has been a problem with the request.",
        success: false,
      });
  } catch (error) {
    res.status(500).json({ error: err, success: false });
  }
});

//GET total sales
router.get("/get/totalsales", async (req, res) => {
  const totalSales = await Order.aggregate([
    { $group: { _id: null, totalSales: { $sum: "$totalPrice" } } },
  ]);
  if (!totalSales)
    return res.status(400).json({
      message: "The total sales could not be generated.",
      success: false,
    });
  return res.status(200).json(totalSales.pop().totalSales);
});

//POST new order (and its order items)
//calculating total price on the backend
router.post("/", async (req, res) => {
  let totalPrice = 0;
  let newOrderItemsIds = await Promise.all(
    req.body.orderItems.map(async (item) => {
      let orderItem = new OrderItem({
        quantity: item.quantity,
        product: item.product,
      });

      let productValue = (
        await Product.findById(orderItem.product).select("price -_id")
      ).price;

      totalPrice += productValue * orderItem.quantity;

      orderItem = await orderItem.save();
      return orderItem.id;
    })
  );

  const order = new Order({
    orderItems: newOrderItemsIds,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    phone: req.body.phone,
    status: req.body.status,
    totalPrice,
    user: req.body.user,
    dateOrdered: req.body.dateOrdered,
  });

  try {
    let newOrder = await order.save();
    if (newOrder) return res.status(201).json(newOrder);
    return res
      .status(400)
      .json({ message: "The order could not be created.", success: false });
  } catch (err) {
    return res.status(500).json({ error: err, success: false });
  }
});

//PUT (update) order status
router.put("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    res.status(400).json({ message: "Invalid id.", success: false });
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
      },
      { new: true }
    );
    if (updatedOrder)
      return res.status(404).json({
        message: "The order with the given ID was not found.",
        success: false,
      });
    return res.status(200).json(updatedOrder);
  } catch (err) {
    return res.status(500).json({ error: err, success: false });
  }
});

//DELETE
router.delete("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    res.status(400).json({ message: "Invalid id.", success: false });
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (deletedOrder) {
      await Promise.all(
        deletedOrder.orderItems.map(
          async (item) => await OrderItem.findByIdAndRemove(item.id)
        )
      );
      return res.status(200).json({
        message: "The product has been deleted",
        success: true,
      });
    }
    return res.status(404).json({
      message: "The product with the given ID has not been found",
      success: false,
    });
  } catch (err) {
    return res.status(500).json({ error: err, success: false });
  }
});

module.exports = router;
