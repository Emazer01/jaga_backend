const jwt = require('jsonwebtoken');
require("dotenv").config();

const Auth = {
  verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.status(401).send("A token is required for authentication");
    jwt.verify(token, process.env.SECRET, (err, user) => {
      if (err) {
        return res.status(403).send('Youre not authenticated, please login first')
        console.log('Youre not authenticated');
      }
      req.user = user
      next()
    })
  }
}

module.exports = Auth;