const express = require('express');
const router = express.Router();
const Joi = require('joi');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin')

const courses = [
    { id: 1, name: 'course1' },
    { id: 2, name: 'course2' },
    { id: 3, name: 'course3' },
];

router.get('/', [auth], (req, res, next) => {
    // Get courses from database
    res.send(courses);
});

// Get single course
router.get('/:id', (req, res) => {
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if (!course) return res.status(404).send('The course with the given id was not found.');
    
    res.send(course);
})

router.post('/', (req, res) => {
    const { error } = validateCourse(req.body); // Deconstructor
    if (error) return res.status(400).send(error.details[0].message);

    const course = { 
        id: courses.length + 1,
        name: req.body.name
    };

    courses.push(course);
    res.send(course);
});

router.put('/:id', (req, res) => {
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if (!course) return res.status(404).send('The course with the given id was not found.');
    

    const { error } = validateCourse(req.body); // Deconstructor
    if (error) return res.status(400).send(error.details[0].message);

    // Update the course
    course.name = req.body.name;
    res.send(course);

})

router.delete('/:id', [auth, admin], (req, res) => {
    // Look up the course
    // Not existing, return 404
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if (!course) return res.status(404).send('The course with the given id was not found.');

    // Delete
    const index = courses.indexOf(course);
    courses.splice(index, 1);
    res.send(course);

    // Return the same course
    return course;
})

function validateCourse(course) {
    const schema = {
        name: Joi.string().min(3).required()
    };

    return Joi.validate(course, schema);
}

module.exports = router;