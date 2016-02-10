
/*
  Registers to ONE Queue.
*/
var consumer = function( queue_number, consumer_hook ){
  "use strict";
  const QUEUE_ID = queue_number || 2;

  var request = require('request');
  var http = require('http');
  var qs = require('querystring');

  var server = http.createServer(function (req, res) {
      var body = '';
      req.on('data', function (chunk) {
        body += chunk;
        if (body.length > 1e6)  // 1e6 ~~~ 1MB
          request.connection.destroy(); // FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
      });

      req.on('end', function () {
        res.writeHead(200, {'Content-Type': 'application/json'});
        var msg = {
          status: 'ok',
          content: qs.parse(body),      // These are used for debugging and testing with multiple consumers.
          port: server.address().port   //
        }
        res.end( JSON.stringify( msg ) +'\n');
        if (!module.parent)
          console.log( JSON.stringify(msg) );
        if ( typeof consumer_hook === 'function')
          consumer_hook( msg );
      });
  })
  .listen(function(){
    var address = server.address();

    console.log('Consumer Server listening on port %j', address);

    request.post('http://localhost:3000/queues/'+QUEUE_ID+'/consumers',{form:{callback_url:'http://localhost:'+address.port}},function (error, res, body) {
      if ( error || (res.statusCode / 100 | 0) !== 2 ){ // status == 2XX
        console.log('Failed URL request...');
      }
    });

  });
};

if (!module.parent) {
    consumer( process.argv.slice(2)[0] );
} else {
    module.exports = consumer;
}
