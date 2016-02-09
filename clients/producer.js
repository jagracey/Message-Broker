"use strict";
/*
  Creates random data to send to the Broker.
*/
const DELAY = 0;

var request = require('request');
var crypto = require('crypto');

const NAME = crypto.createHash('md5').update( Math.random().toString() ).digest("hex");
var message_count = 0;

function produceMessage(){
  var queue = 2; // Math.random()*5|0;
  var payload = NAME +'|'+ (message_count++) +'|'+ queue +'|';

  console.log('Sending request: '+ payload);

    var options = {
      url: 'http://localhost:3000/queues/'+ queue +'/messages',
      method: 'POST',
      body: payload,
      headers: { 'Content-Type': 'text/plain' }
    };
    request.post(options,function (error, response, body) {
      if (error){
        console.log(error,response.statusCode,body);
        return process.exit(1);
      }
      console.log(body);
      setTimeout(function(){ produceMessage(); }, DELAY);
    });

}

for ( var i= 0; i < 10; i++)
  produceMessage();
