const express = require("express");
const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../models/user");

//GET all users excluding pwhash
router.get("/", async (req, res) => {
  try {
    const userList = await User.find().select("-passwordHash");
    if (userList) res.status(200).json(userList);
    else
      res.status(400).json({
        message: "The users list could not be retrieved",
        success: false,
      });
  } catch (err) {
    res.status(500).json({ error: err, success: false });
  }
});

//GET user by id excluding pwhash
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-passwordHash");
    if (user) res.status(200).json(user);
    else
      res
        .status(404)
        .json({ message: "User with given ID not found.", success: false });
  } catch (error) {
    res.status(500).json({ error: err, success: false });
  }
});

//GET product count
router.get("/get/count", async (req, res) => {
  try {
    const userCount = await User.countDocuments((count) => count);
    if (userCount) res.status(200).json({ userCount, success: true });
    else
      res.status(400).json({
        message: "There has been a problem with the request.",
        success: false,
      });
  } catch (error) {
    res.status(500).json({ error: err, success: false });
  }
});

//POST new user
router.post("/", async (req, res) => {
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcryptjs.hashSync(
      req.body.password,
      bcryptjs.genSaltSync(10)
    ),
    street: req.body.street,
    apartment: req.body.apartment,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
  });
  try {
    let newUser = await user.save();
    if (newUser) res.status(201).json(newUser);
    else
      res
        .status(400)
        .json({ message: "The user could not be created", success: false });
  } catch (err) {
    res.status(500).json({ error: err, success: false });
  }
});

//POST user information and login
router.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    res.status(400).json({ message: "User e-mail not found", success: false });
  else if (bcryptjs.compareSync(req.body.password, user.passwordHash)) {
    const token = jwt.sign(
      { userId: user.id, isAdmin: user.isAdmin },
      process.env.AUTH_SECRET,
      {
        expiresIn: "1d",
      }
    );
    res.status(200).json({
      user: user.email,
      token,
      success: true,
    });
  } else
    res.status(400).json({ message: "Incorrect password.", success: false });
});

//DELETE
router.delete("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    res.status(400).json({ message: "Invalid id.", success: false });

  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (deletedUser)
      res
        .status(200)
        .json({ message: "The user has been deleted", success: true });
    else
      res.status(404).json({
        message: "User not found",
        success: false,
      });
  } catch (err) {
    res.status(500).json({ error: err, success: false });
  }
});

module.exports = router;
