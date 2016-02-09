"use strict";

/*
  Message IDs are unique, even between different Queues.
*/

var message_count = 0;
exports.post = function(req, res) {
  var qid = +req.params.qid;
  if ( !Number.isInteger(qid) || qid < 0)
    return res.status(400).json({ status: 'error', error: 'Queue ID must be a positive integer.' });

  var text = req.text;

  var q = qManager[qid];
  if (typeof q !== 'object')
    return res.status(410).json({ status: 'error', error: 'Queue not found' });
  else if ( !text ){
    console.log('text:'+text);
    return res.status(400).json({ status: 'error', error: 'Text data not valid' });
  }

  q.consumers
    .filter(function(consumer){ return consumer !== null;})
    .forEach(function(consumer){
      var msg = {
        queue_id: qid,
        queue_name: q.name,
        consumer_id: consumer.id,
        message_id: message_count++,
        message_attempt: 0,
        callback_url: consumer.callback_url,
        body: text
      };
      q.taskQueue.push(msg);
  });

  return res.status(200).json({ status: 'ok' });
};
