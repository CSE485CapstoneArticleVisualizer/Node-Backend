function log(req, res, next) {
    console.log('Logging...');
    //console.log(req);
    next();
}

module.exports = log