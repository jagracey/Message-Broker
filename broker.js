
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





var CONCURRENT_TASKS = 500;

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
