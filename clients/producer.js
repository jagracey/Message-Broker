"use strict";
/*
  Creates random data to send to the Broker.
*/
const DELAY = 0;
var queue = process.argv.slice(2)[0] || 2;

var request = require('request');
var crypto = require('crypto');

const NAME = crypto.createHash('md5')
              .update( Math.random().toString() )
              .digest("hex");
var message_count = 0;

function produceMessage(){
  var payload = NAME +'|'+ (message_count++) +'|'+ queue +'|';

  console.log(`Sending request: ${payload}`);

    var options = {
      url: `http://localhost:3000/queues/${queue}/messages`,
      method: 'POST',
      body: payload,
      headers: { 'Content-Type': 'text/plain' }
    };
    request.post(options,function (error, res, body) {
      if (error){
        console.log(error, body, (res||{}).statusCode);
        return process.exit(1);           // Arbitrarily decide to exit if the Broker breaks....
      }
      console.log(body);
      setTimeout(produceMessage, DELAY);
    });

}

for ( var i= 0; i < 10; i++)
  produceMessage();
