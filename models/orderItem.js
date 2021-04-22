const mongoose = require("mongoose");

//products
const orderItemSchema = mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: Number,
  required: true,
});

orderItemSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

orderItemSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("OrderItem", orderItemSchema);
