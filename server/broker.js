"use strict";

/*
Asumptions and Choices:

- Consumer simply needs to respond with a 2XX status code, doesn't read text.
- Each Queue gets its own queue data structure.
- Failed consumer requests get put back in the beggining of the queue- without a minimum delay. MAX_REQUEST_RETRIES is set to Infinity.
- Callback_url is not validated as a URL.
*/

global.MAX_REQUEST_RETRIES = Infinity;  // How many requests to attempt before giving up on the consumer.
global.CONCURRENT_TASKS_PER_QUEUE = 10;

global.qManager = [];

var dotenv = require('dotenv');
var logger = require('morgan');
var express = require('express');
var bodyParser = require('body-parser');
var compression = require('compression');
var errorHandler = require('errorhandler');

// Load environment variables from .env file.
dotenv.load({ path: '.env' });

var app = express();
// req.text  (http://stackoverflow.com/questions/12497358/handling-text-plain-in-express-3-via-connect/12497793#12497793)
app.use(function(req, res, next){
  if (req.is('text/*')) {
    req.text = '';
    req.setEncoding('utf8');
    req.on('data', function(chunk){ req.text += chunk; });
    req.on('end', next);
  }
  else {
    next();
  }
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(compression());
app.use(logger('tiny'));
app.set('port', process.env.PORT || 3000);

var queueManagerController = require('./controllers/queueManager');
var publisherController = require('./controllers/publisher');
var consumerController = require('./controllers/consumer');

// Queue Management
app.get('/queues', queueManagerController.get );
app.post('/queues', queueManagerController.post );
app.put('/queues/:qid', queueManagerController.put );
app.delete('/queues/:qid', queueManagerController.delete );

// Publish Messages
app.post('/queues/:qid/messages', publisherController.post );

// Consume Messages
app.get('/queues/:qid/consumers', consumerController.get );
app.post('/queues/:qid/consumers', consumerController.post );
app.delete('/queues/:qid/consumers/:consumer_id', consumerController.delete );


/**
 * Error Handler.
 */
app.use(errorHandler());


/**
 * Start Express server.
 */
app.listen(app.get('port'), function() {
  console.log('Message Broker server listening on port %d in %s mode', app.get('port'), app.get('env'));
});

module.exports = app;
