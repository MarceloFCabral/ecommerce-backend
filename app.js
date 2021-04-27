const express = require("express");
const morgan = require("morgan");
const jwtAuth = require("./helpers/jwtAuth");
const errorHandler = require("./helpers/errorHandler");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv/config");
const api = process.env.API_URL;

const app = express();

//enabling CORS
app.use(cors());
app.options("*", cors());

//routers import
const productsRoutes = require("./routers/products");
const categoriesRoutes = require("./routers/categories");
const ordersRoutes = require("./routers/orders");
const usersRoutes = require("./routers/users");

//middleware
app.use(express.json());
app.use(morgan("tiny"));
app.use(jwtAuth());
app.use(errorHandler);
app.use("/uploads/:filename", express.static("public/uploads"), (req, res) => {
  const basePath = `${__dirname}/public/uploads/`;
  res.sendFile(`${basePath}${req.params.filename}`);
});

//routers
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/orders`, ordersRoutes);
app.use(`${api}/users`, usersRoutes);

mongoose
  .connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database connection successful"))
  .catch((err) => console.log(err));

app.listen(3000, () => {
  console.log("The server is running now!");
});
