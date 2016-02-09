"use strict";

var taskQueue = require('./../library/taskQueue');


exports.get = function(req, res) {
  return res.status(200).json(qManager);
};


exports.post = function(req, res) {
  var name = req.body.name;
  var id = qManager.length;

  if ( !typeof name === 'string')
    return res.status(400).json({ status: 'error', error: 'Name must be of type string' });

  qManager.push({ id: id, name: name, consumers: [], taskQueue: taskQueue()});
  return res.status(201).json({ status: 'ok', id: id });
};


exports.put = function(req, res) {
  var qid = +req.params.qid;
  var name = req.body.name;
  if ( !Number.isInteger(qid) || qid < 0)
    return res.status(400).json({ status: 'error', error: 'Queue ID must be a positive integer.' });

  if ( !typeof name === 'string')
    return res.status(400).json({ status: 'error', error: 'Name must be of type string' });

  if ( typeof qManager[qid] === 'object'){
    qManager[qid].name = name;
    return res.status(200).json({ status: 'ok' });
  }
  else
    return res.status(410).json({ status: 'error', error: 'Queue not found' });
};


exports.delete = function(req, res) {
  var qid = +req.params.qid;
  if ( !Number.isInteger(qid) || qid < 0)
    return res.status(400).json({ status: 'error', error: 'Queue ID must be a positive integer.' });

  delete qManager[qid];
  return res.status(200).json({ status: 'ok' });
};
