const winston = require("winston");
const express = require("express");
const app = express();
const config = require("config");

app.set("view engine", "pug");
app.set("views", "./views"); // Views for template engine

require("./startup/cors")(app);
require("./startup/logging")(app);
require("./startup/routes")(app);
require("./startup/database")();
require("./startup/config")();
require("./startup/validation")();
require("./startup/prod")(app);

port = process.env.PORT || config.get("port") || 3000;
const server = app.listen(port, () => {
  winston.info(`Listening to port ${port}`);
});

module.exports = server;
