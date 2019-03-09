// We can remove this middleware since we use an npm package to handle this automatically
// express-async-errors (in logging.js)
module.exports = function (handler) {
    return async (req, res, next) => {
        try {
            await handler(req, res);
        }
        catch(ex) {
            next(ex);
        }
    }
}