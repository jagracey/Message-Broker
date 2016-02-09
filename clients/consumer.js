"use strict";
/*
  Registers to ONE Queue.
*/

const QUEUE_ID = 2;

var request = require('request');
var http = require('http');

var server = http.createServer(function (req, res) {
    var body = '';
    req.on('data', function (chunk) {
      body += chunk;
    });

    req.on('end', function () {
      console.log( decodeURI(body) );
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end('{ "status": "ok"}\n');
    });

    /*
      If you don't care for the ENTIRE response as per broker spec,
      you can remove the above and uncomment the below two lines
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end('{ "status": "ok"}\n');
    */
})
.listen(function(){
  var address = server.address();
  console.log('opened server on %j', address);

  request.post('http://localhost:3000/queues/'+QUEUE_ID+'/consumers',{form:{callback_url:'http://localhost:'+address.port}},function (error, res, body) {
    if ( error || (res.statusCode / 100 | 0) !== 2 ){ // status == 2XX
      console.log('Failed URL request...');
    }
  });

});
