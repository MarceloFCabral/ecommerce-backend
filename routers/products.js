const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const router = express.Router();
const Category = require("../models/category");
const Product = require("../models/product");

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

//creating and configuring multer diskStorage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadError = FILE_TYPE_MAP[file.mimetype]
      ? new Error("Invalid image type!")
      : null;
    cb(uploadError, "public/uploads");
  },
  filename: (req, file, cb) => {
    const extension = FILE_TYPE_MAP[file.mimetype];
    const fileName = file.originalname.replace(" ", "-");
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const upload = multer({ storage });

//GET all products
router.get("/", async (req, res) => {
  let categoriesFilter = {};
  if (req.query.categories)
    categoriesFilter = { category: req.query.categories.split(",") };
  try {
    //passing an empty object to find() is interpreted as "no filter/get all"
    const productsList = await Product.find(categoriesFilter).populate(
      "category"
    );
    if (productsList) res.status(200).json(productsList);
    else
      res.status(404).json({
        message: "Could not retrieve the products list.",
        success: false,
      });
  } catch (err) {
    res.status(500).json({ error: err, success: false });
  }
});

//GET a single product
router.get("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    res.status(400).json({ message: "Invalid id.", success: false });

  try {
    const product = await Product.findById(req.params.id).populate("category");
    if (product) res.status(200).json(product);
    else
      res.status(404).json({
        message: "Could not find the product with the given id.",
        success: false,
      });
  } catch (err) {
    res.status(500).json({ error: err, success: false });
  }
});

//GET product count
router.get("/get/count", async (req, res) => {
  try {
    const productCount = await Product.countDocuments((count) => count);
    if (productCount) res.status(200).json({ productCount, success: true });
    else
      res.status(400).json({
        message: "There has been a problem with the request.",
        success: false,
      });
  } catch (error) {
    res.status(500).json({ error: err, success: false });
  }
});

//GET featured products
router.get("/get/featured", async (req, res) => {
  try {
    const productsList = await Product.find({ isFeatured: true });
    if (productsList) res.status(200).json(productsList);
    else
      res.status(400).json({
        message: "There has been a problem with the request.",
        success: false,
      });
  } catch (err) {
    res.status(500).json({ error: err, success: false });
  }
});

//POST
router.post("/", upload.single("image"), async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category)
    res.status(400).json({ message: "Invalid category.", success: false });

  if (!req.file)
    res
      .status(400)
      .json({ message: "No image file has been sent", success: false });

  const fileName = req.file.filename; //filename provided by the multer middleware (upload.single)
  const basePath = `${req.protocol}://${req.get("host")}/public/upload/`;
  const product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: `${basePath}${fileName}`,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
  });
  try {
    let newProduct = await product.save();
    if (newProduct) res.status(201).json(newProduct);
    else
      res
        .status(400)
        .json({ message: "The product could not be created", success: false });
  } catch (err) {
    res.status(500).json({ error: err, success: false });
  }
});

//PUT
router.put("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(400).json({ message: "Invalid id.", success: false });

  const category = await Category.findById(req.body.category); //validating the category id sent in the body of the req
  if (!category)
    return res
      .status(400)
      .json({ message: "Invalid category.", success: false });

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
      },
      { new: true }
    );
    if (updatedProduct) return res.status(200).json(updatedProduct);
    return res
      .status(400)
      .json({ message: "The product could not be updated", success: false });
  } catch (err) {
    return res.status(500).json({ error: err, success: false });
  }
});

//PUT galery images
router.put(
  "/gallery-images/:id",
  upload.array("images", 10),
  async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ message: "Invalid id.", success: false });

    try {
      const basePath = `${req.protocol}://${req.get("host")}/public/upload/`;
      let imagesPaths = [];
      imagesPaths = req.files.map((file) => `${basePath}${file.filename}`);
      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
          images: imagesPaths,
        },
        { new: true }
      );
      if (updatedProduct) return res.status(200).json(updatedProduct);
      return res
        .status(400)
        .json({ message: "The product could not be updated", success: false });
    } catch (err) {
      return res.status(500).json({ error: err, success: false });
    }
  }
);

//DELETE
router.delete("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    res.status(400).json({ message: "Invalid id.", success: false });

  try {
    const deletedProduct = await Product.findByIdAndRemove(req.params.id);
    if (deletedProduct)
      res
        .status(200)
        .json({ message: "The product has been deleted.", success: true });
    else
      res.status(404).json({ message: "Product not found.", success: false });
  } catch (err) {
    res.status(500).json({ error: err, success: false });
  }
});

module.exports = router;
