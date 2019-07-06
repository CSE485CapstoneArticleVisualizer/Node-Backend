const express = require('express');
const data = require('../routes/data');
const home = require('../routes/home');
const error = require('../middleware/error');

module.exports = function(app) {    
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.static('public')); 
    
    app.use('/api/data', data);
    app.use('/', home);

    // Error middleware (must be last one)
    app.use(error);
}