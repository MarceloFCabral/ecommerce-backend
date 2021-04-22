const errorHandler = (err, req, res, next) => {
  //err -> native V8 engine object with properties stack, name and message.
  if (err.name === "UnauthorizedError")
    return res
      .status(403)
      .json({ message: "Token not valid.", success: false });

  if (err.name === "ValidationError")
    return res
      .status(401)
      .json({ message: "Operation not valid.", success: false });

  return res.status(500).json(err);
};

module.exports = errorHandler;
