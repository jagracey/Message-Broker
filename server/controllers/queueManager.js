"use strict";

var taskQueue = require('./../library/taskQueue');


exports.get = function(req, res) {
  var qs = qManager
            .filter(function(q){ return q != null; })
            .map(function(q){ return {id: q.id, name: q.name}; });
  return res.status(200).json( qs );
};


exports.post = function(req, res) {
  var name = req.body.name;
  var id = qManager.length;

  if ( !name || !typeof name === 'string')
    return res.status(400).json({ status: 'error', error: 'Name must be of type string' });

  qManager.push({ id: id, name: name, consumers: [], taskQueue: taskQueue()});
  return res.status(201).json({ status: 'ok', id: id });
};


exports.put = function(req, res) {
  var qid = +req.params.qid;
  var name = req.body.name;
  if ( !Number.isInteger(qid) || qid < 0)
    return res.status(400).json({ status: 'error', error: 'Queue ID must be a positive integer.' });

  var q = qManager[qid];
  if (typeof q !== 'object')
    return res.status(410).json({ status: 'error', error: 'Queue not found' });

  if ( !typeof name === 'string')
    return res.status(400).json({ status: 'error', error: 'Name must be of type string' });

  if ( typeof qManager[qid] === 'object'){
    qManager[qid].name = name;
    return res.status(200).json({ status: 'ok' });
  }
};


exports.delete = function(req, res) {
  var qid = +req.params.qid;
  if ( !Number.isInteger(qid) || qid < 0)
    return res.status(400).json({ status: 'error', error: 'Queue ID must be a positive integer.' });

  if ( qManager[qid] == null )
    return res.status(410).json({ status: 'error', error: 'Queue not found.' });

  delete qManager[qid];
  return res.status(200).json({ status: 'ok' });
};
