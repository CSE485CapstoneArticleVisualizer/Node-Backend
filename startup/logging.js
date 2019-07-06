const morgan = require('morgan'); 
const winston = require('winston');
// require('winston-mongodb');
require('express-async-errors');

const errorStackFormat = winston.format(info => {
    if (info instanceof Error) {
        return Object.assign({}, info, {
        stack: info.stack,
        message: info.message
        })
    }
    return info
})

module.exports = function (app) {
    // Handle Exceptions
    // (DEPRECATED) winston.handleExceptions(new winston.transports.File({ filename: 'uncaughtExceptions.log' }))
    // winston.exceptions.handle(
    //     new winston.transports.File({ filename: 'uncaughtExceptions.log', format: winston.format.simple() }),
    //     new winston.transports.Console({ format: winston.format.simple(), colorize: true, prettyPrint: true })
    // )

    // Hack to handle rejections as an exception
    process.on('unhandledRejection', (rej) => {
        throw rej;
    })

    // // Add file transport and mongodb transport
    winston.add(new winston.transports.Console({ format: winston.format.combine(errorStackFormat(), winston.format.simple()), colorize: true, prettyPrint: true }))
    winston.add(new winston.transports.File({ filename: 'logfile.log' }));
    // winston.add(new winston.transports.MongoDB({
    //     db: 'mongodb://localhost/playground',
    //     level: 'info'
    // }));

    // Morgan (request logging)
    if (app.get('env') === 'development') {
        app.use(morgan('tiny'));
        winston.info('Morgan enabled...');
    }
}