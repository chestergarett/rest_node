const debug = require('debug')('app:startup');
const config = require('config');
const morgan = require('morgan');
const helmet = require('helmet');
const Joi = require('joi');
const logger = require('./logger');
const express = require('express');
const app = express();

// configuration
console.log(`Application Name: ${config.get('name')}`);
console.log(`Mail Server: ${config.get('mail.host')}`);
// console.log(`Mail Password: ${config.get('mail.password')}`);

//setting environment
if(app.get('env') === 'development'){
    app.use(morgan('tiny'));
    debug('Morgan enabled');
}

//use middleware
app.use(express.json());

app.use(logger);
//to use query params for REST API
app.use(express.urlencoded({extended: true }));
//to use static files for REST API
app.use(express.static('./public'));
app.use(helmet());


const courses = [
    { id: 1, name: 'course1' },
    { id: 2, name: 'course2' },
    { id: 3, name: 'course3' },
];

//get requests
app.get('/', (req, res) => { 
    res.send('Hello World!!!');
});

app.get('/api/courses', (req,res) => { 
   res.send(courses); 
});

app.get('/api/courses/:id', (req,res) => { 
    const course = courses.find(c => c.id === parseInt(req.params.id));
    
    if (!course) return res.status(404).send('The course with the given ID was not found');
    res.send(course);
});

//post requests
app.post('/api/courses', (req,res) => { 
    const { error } = validateCourse(req.body);
    

    if (error) { 
        res.status(400).send(error.details.map(detail => detail.message));
        return;
    }

    const course = {
        id: courses.length + 1,
        name: req.body.name,
    }
    ;
    courses.push(course);
    res.send(course);
});

//put requests
app.put('/api/courses/:id', (req,res)=> {
    //Lookup the course
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if (!course) return res.status(404).send('The course with the given ID was not found');

    //Validate
    const { error } = validateCourse(req.body);
    if (error) { 
        res.status(400).send(error.details.map(detail => detail.message));
        return;
    }

    //Update Course
    course.name = req.body.name;
    //Return updated course
    res.send(course);

});

//delete requests
app.delete('/api/courses/:id', (req,res) => {
    //Lookup the course
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if (!course) return res.status(404).send('The course with the given ID was not found');

    const index = courses.indexOf(course);
    courses.splice(index, 1);

    res.send(course);
});

//PORT
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Listening on port ${port}...`)
})

const validateCourse = (course) => {
    const schema = {
        name: Joi.string().min(3).required()
    };
    return Joi.validate(course, schema);
}