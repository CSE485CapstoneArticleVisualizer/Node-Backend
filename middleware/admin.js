const config = require("config");

module.exports = function(req, res, next) {
  if (!config.get("requiresAuth")) return next();

  // Executed after authorization function
  if (!req.user.isAdmin) return res.status(403).send("Access Denied.");
  // 401 = Unauthorized (When the user tries to access a protected resource but they don't provide a valid jwt)
  // 403 = Don't try again. You can't access that resource with your current jwt

  next();
};
