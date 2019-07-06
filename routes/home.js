const express = require('express')
const router = express.Router()

router.use(function timelog (req, res, next) {
    console.log('Home.js Time:', Date.now())
    next()
})

router.get('/', (req, res) => {
    //res.send('Hello World');
    res.render('index', { title: "Capstone Project", message: "Hello user. The information you require is at the endpoint /api/data"})
});

module.exports = router;