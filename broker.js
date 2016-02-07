
`
Message Broker Project

TODO:
  1) Circular Buffer for Queue implementation. This lets us avoid Array's "unshift" for enqueuing. Better than a JS Linked List.
  2) HTTP requests
`

(function () {
  "use strict";

  var Deque = require('double-ended-queue');

  // Queue -- https://github.com/caolan/async/blob/master/deps/nodeunit.js#L1050
  async.queue = function (worker, concurrency) {
      var workers = 0;

      tasks = new Deque(1000); // Set initial capactity at 10,000
      var q = {
          concurrency: concurrency,
          push: function (data, callback) {
              tasks.insertFront({data: data, callback: callback});
              process.nextTick(q.process);
          },
          process: function () {
              if (workers < q.concurrency && tasks.isEmpty()) {
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

});
