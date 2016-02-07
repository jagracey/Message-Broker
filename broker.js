
`
Message Broker Project

TODO:
  1) Circular Buffer for Queue implementation. This lets us avoid Array's "unshift" for enqueuing. Better than a JS Linked List.
  2) HTTP requests
`

(function () {
  "use strict";
  // Queue -- https://github.com/caolan/async/blob/master/deps/nodeunit.js#L1050
  async.queue = function (worker, concurrency) {
      var workers = 0;
      var tasks = [];
      var q = {
          concurrency: concurrency,
          push: function (data, callback) {
              tasks.push({data: data, callback: callback});
              async.nextTick(q.process);
          },
          process: function () {
              if (workers < q.concurrency && tasks.length) {
                  var task = tasks.splice(0, 1)[0];
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
          length: function () {
              return tasks.length;
          }
      };
      return q;
  };

});
