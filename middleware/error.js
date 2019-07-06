const winston = require("winston");
module.exports = function(err, req, res, next) {
  // Log the exception
  winston.error(
    `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${
      req.method
    } - ${req.ip}\nStack Trace:\n${err.stack}`
  ); // Metadata is in second argument
  // winston.log('error', err.message, err);

  // other levels include
  // error
  // warn
  // info
  // verbose
  // debug
  // silly

  res.status(500).send("Something failed");
};