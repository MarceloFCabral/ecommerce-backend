const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Category = require("../models/category");

//GET all categories
router.get("/", async (req, res) => {
  try {
    const categoryList = await Category.find();
    res.status(200).json(categoryList);
  } catch (err) {
    res.status(500).json({ error: err, success: false });
  }
});

//GET category by id
router.get("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    res.status(400).json({ message: "Invalid id.", success: false });

  const category = await Category.findById(req.params.id);
  try {
    if (category) res.status(200).json(category);
    else
      res.status(404).json({
        message: "The category with the given ID was not found",
        success: false,
      });
  } catch (err) {
    res.status(500).json({ error: err, success: false });
  }
});

//PUT
router.put("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    res.status(400).json({ message: "Invalid id.", success: false });

  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color,
      },
      { new: true } //return the new JSON data instead of the old one
    );
    if (updatedCategory) res.status(200).json(updatedCategory);
    else
      res
        .status(400)
        .json({ message: "The category could not be updated", success: false });
  } catch (err) {
    res.status(500).json({ error: err, success: false });
  }
});

//POST
router.post("/", async (req, res) => {
  const category = new Category({
    name: req.body.name,
    icon: req.body.icon,
    color: req.body.color,
  });
  try {
    let newCategory = await category.save();
    if (newCategory) res.status(201).json(newCategory);
    else
      res.status(400).json({
        message: "The category could not be created.",
        success: false,
      });
  } catch (err) {
    res.status(500).json({ error: err, success: false });
  }
});

//DELETE
// /aoi/v1/id
router.delete("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    res.status(400).json({ message: "Invalid id.", success: false });

  try {
    const deletedCategory = await Category.findByIdAndRemove(req.params.id);
    if (deletedCategory)
      res
        .status(200)
        .json({ message: "The category has been deleted.", success: true });
    else
      res.status(404).json({ message: "Category not found.", success: false });
  } catch (err) {
    res.status(500).json({ error: err, success: false });
  }
});

module.exports = router;
