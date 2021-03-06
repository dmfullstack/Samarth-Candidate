var http = require('http');
var express = require('express');
var proxy = require('http-proxy');
var path = require('path');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var authRoutes = require('./webserver/auth/authrouter');
var authByToken = require('./webserver/auth/authbytoken');

var resourcebundle = require('./webserver/resourcebundle/resourcebundlerouter.js');

mongoose.connect('mongodb://localhost:27017/samarthplatformdb');

//Creating proxy object
var platformProxy = proxy.createProxyServer();

//Express App created
var app = express();



/*============================================
=            proxy implementation            =
============================================*/

//The below app route config should be placed after all the local resources have ended 
app.use("/proxy",function(req, res) {
    var options = {
        target: {
            host: 'localhost',
            port: 8081
        }
    };
    console.log('proxying')
    platformProxy.web(req, res, options);
});

platformProxy.on('error', function(err, req, res) {
    console.log("Error in proxy pass: ", err);
});

/*platformProxy.on('proxyReq', function(proxyReq, req, res, options) {
    proxyReq.setHeader('customer-header', 'custom-header-value');
});*/

/*=====  End of proxy implementation  ======*/




app.onAppStart = function(addr) {
    console.log("Samarth-Candidateprofile web app is now Running on port:", addr.port);
}

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'bower_components')));
app.use(express.static(path.join(__dirname, 'webapp')));

function isUserAuthenticated(req, res, next) {
    var token = req.body.usrtoken || req.query.usrtoken || req.headers[
        'x-user-access-token'];

    if (!token) {
        console.log("Token not found for authentication validation....!");
        return res.status(403).json({
            error: 'Invalid user request or unauthorised request..!'
        });
    }

    authByToken.isUserAuthenticated(token, function(user) {
            req.user = user;
            next();
        },
        function(err) {
            res.status(403).json({
                error: err
            });
        }
    );
}

app.use('/', authRoutes);
app.use("/resource", resourcebundle);




app.use(function(req, res, next) {
    var err = new Error('Resource not found');
    err.status = 404;
    return res.status(err.status).json({
        "error": err.message
    });
});

if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        logger.error("Internal error in watch processor: ", err);
        return res.status(err.status || 500).json({
            "error": err.message
        });
    });
}

app.use(function(err, req, res, next) {
    logger.error("Internal error in watch processor: ", err);
    return res.status(err.status || 500).json({
        "error": err.message
    });
});

module.exports = app;
