
/*
  Message Broker Project

  TODO:
    1) Circular Buffer for Queue implementation. This lets us avoid Arrays "unshift" for enqueuing. Better than a JS Linked List.
    2) HTTP requests
*/

"use strict";

var Deque = require('double-ended-queue');

// Queue -- https://github.com/caolan/async/blob/master/deps/nodeunit.js#L1050
var taskQueue = function (worker, concurrency) {
  var workers = 0;

  // TODO: testing with gobal
  global.tasks = new Deque(1000); // Set initial capactity at 1,000
  var q = {
      concurrency: concurrency,
      push: function (data, callback) {
          tasks.insertFront({data: data, callback: callback});
          process.nextTick(q.process);
      },
      process: function () {
          if (workers < q.concurrency && !tasks.isEmpty()) {
              var task = tasks.removeBack();
              workers += 1;
              worker(task.data, function () {
                  workers -= 1;
                  if (task.callback) {
                      task.callback.apply(task, arguments);
                  }
                  q.process();
              });
          }
      },
  };
  return q;
};





var CONCURRENT_TASKS = 500;  // Can be changed live.

var q = taskQueue(function (task, callback) {
  console.log('hello ' + task.name);
  callback();
}, CONCURRENT_TASKS);


// assign a callback
q.drain = function() {
  console.log('all items have been processed');
}

// add some items to the queue

q.push({name: 'foo'}, function (err) {
  console.log('finished processing foo');
});
q.push({name: 'bar'}, function (err) {
  console.log('finished processing bar');
});







var compression = require('compression');
var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var errorHandler = require('errorhandler');
var dotenv = require('dotenv');


// Load environment variables from .env file.
dotenv.load({ path: '.env' });

var queueController = require('./controllers/queue');
var publisherController = require('./controllers/publisher');
var consumerController = require('./controllers/consumer');

var app = express();
app.set('port', process.env.PORT || 3000);
app.use(compression());
app.use(logger('prod'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Queue Management
app.get('/queues', queueController.get );
app.post('/queues', queueController.post );
app.put('/queues/:id', queueController.put );
app.delete('/queues/:id', queueController.delete );

// Publish Messages
app.post('/queues/:id/messages', publisherController.post );

// Consume Messages
app.post('/queues/:id/consumers', consumerController.post );
app.get('/queues/:id/consumers', consumerController.get );
app.delete('/queues/:id/consumers/:consumer_id', consumerController.delete );

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
