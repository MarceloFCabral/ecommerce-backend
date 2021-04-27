//const jwt = require("jsonwebtoken");
const jwtAuth = require("express-jwt");

const revokingFunc = async (req, payload, done) => {
  if (!payload.isAdmin) done(null, true);
  done();
};

const auth = () => {
  const api = process.env.API_URL;
  return jwtAuth({
    secret: process.env.AUTH_SECRET,
    algorithms: ["HS256"],
    isRevoked: revokingFunc,
  }).unless({
    path: [
      { url: /\/uploads(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/products(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/categories(.*)/, methods: ["GET", "OPTIONS"] },
      `${api}/users/login`,
      `${api}/users/register`,
    ],
  });
};
/*
const auth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null)
    return res
      .status(401)
      .json({ message: "Token not provided.", success: false });
  jwt.verify(token, process.env.AUTH_SECRET, (err, userObj) => {
    if (err)
      return res
        .status(403)
        .json({ message: "Token not valid.", success: false });
    req.userId = userObj.userId;
    next();
  });
};
*/

module.exports = auth;
