var supertest = require("supertest");
var should = require("should");
var broker = require('./../server/broker.js');
var test = supertest.agent("http://localhost:"+ broker.app.get('port') );


// Spoon (unfork) + Consumer lets us spin up the collector server and receive callbacks when testing- without messing up Consumer's codebase.
var spoon = require('./../server/library/spoon.js');



describe("Queue Management",function(){

  it("should return an empty list of Queues",function(done){
    test
    .get('/queues')
    .end(function(err,res){
      res.status.should.equal(200);
      res.body.should.have.lengthOf(0);
      broker.qManager.should.have.lengthOf(0);
      done();
    });
  });

  it("should create a new Queue with ID == 0",function(done){
    test
    .post('/queues')
    .send('name=PeopleQueue')
    .end(function(err,res){
      res.status.should.equal(201);
      res.body.status.should.equal('ok');
      res.body.id.should.equal(0);
      broker.qManager.should.have.lengthOf(1);
      broker.qManager[0].name.should.equal('PeopleQueue');
      done();
    });
  });

  it("should NOT create a new Queue",function(done){
    test
    .post('/queues')
    .send('nameWrongField=NotCreatedQueue')
    .end(function(err,res){
      res.status.should.equal(400);
      res.body.status.should.equal('error');
      broker.qManager.should.have.lengthOf(1);
      broker.qManager[0].name.should.equal('PeopleQueue'); // Optionally, make sure nothing changes from above test.
      done();
    });
  });

  it("should return an list with one Queue named 'PeopleQueue' with ID == 0",function(done){
    test
    .get('/queues')
    .end(function(err,res){
      res.status.should.equal(200);
      res.body.should.have.lengthOf(1);
      res.body[0].id.should.equal(0);
      res.body[0].name.should.equal('PeopleQueue');
      broker.qManager.should.have.lengthOf(1);
      done();
    });
  });

  it("should rename Queue #0",function(done){
    test
    .put('/queues/0')
    .send('name=BeerQueue')
    .end(function(err,res){
      res.status.should.equal(200);
      res.body.status.should.equal('ok');
      broker.qManager[0].name.should.equal('BeerQueue');
      done();
    });
  });

  it("should *FAIL* rename Queue #3 -- unmatched queue_id",function(done){
    test
    .put('/queues/3')
    .send('name=BeerQueue')
    .end(function(err,res){
      res.status.should.equal(410);
      res.body.status.should.equal('error');
      broker.qManager.should.have.lengthOf(1);
      broker.qManager[0].name.should.equal('BeerQueue');
      done();
    });
  });

  it("should *FAIL* rename Queue #3 -- queue_id is wrongfully string",function(done){
    test
    .put('/queues/john')
    .send('name=BeerQueue')
    .end(function(err,res){
      res.status.should.equal(400);
      res.body.status.should.equal('error');
      broker.qManager.should.have.lengthOf(1);
      broker.qManager[0].name.should.equal('BeerQueue');
      done();
    });
  });

  it("should return an list with one Queue named 'BeerQueue with ID == 0'",function(done){
    test
    .get('/queues')
    .end(function(err,res){
      res.status.should.equal(200);
      res.body.should.have.lengthOf(1);
      res.body[0].id.should.equal(0);
      res.body[0].name.should.equal('BeerQueue');
      broker.qManager.should.have.lengthOf(1);
      done();
    });
  });

  it("should fail to delete anything'",function(done){
    test
    .delete('/queues/2')
    .end(function(err,res){
      res.status.should.equal(410);
      res.body.status.should.equal('error');
      broker.qManager.should.have.lengthOf(1);
      done();
    });
  });

  it("should AGAIN, return an list with one Queue named 'BeerQueue with ID == 0'",function(done){
    test
    .get('/queues')
    .end(function(err,res){
      res.status.should.equal(200);
      res.body.should.have.lengthOf(1);
      res.body[0].id.should.equal(0);
      res.body[0].name.should.equal('BeerQueue');
      broker.qManager.should.have.lengthOf(1);
      done();
    });
  });

  it("should delete the queue of ID == 0'",function(done){
    test
    .delete('/queues/0')
    .end(function(err,res){
      res.status.should.equal(200);
      res.body.status.should.equal('ok');

      broker.qManager.should.have.lengthOf(1);  // We only delete Queue from array, deleted Queues still effect the length...
      should.not.exist(broker.qManager[0]);
      done();
    });
  });

  it("should return an empty list of Queues",function(done){
    test
    .get('/queues')
    .end(function(err,res){
      res.status.should.equal(200);
      res.body.should.have.lengthOf(0);

      broker.qManager.should.have.lengthOf(1);  // We only delete Queue from array, deleted Queues still effect the length...
      should.not.exist(broker.qManager[0]);
      done();
    });
  });

});





describe("Producer Management",function(){

  it("should *NOT* post a message -- unmatched queue.",function(done){
    test
    .post('/queues/0/messages')
    .set('Content-Type', 'text/plain')
    .send('hello world #wo723mdsf')
    .end(function(err,res){
      res.status.should.equal(410);
      res.body.status.should.equal('error');
      done();
    });
  });

  it("should *NOT* post a message -- invalid string queue_id.",function(done){
    test
    .post('/queues/John/messages')
    .set('Content-Type', 'text/plain')
    .send('hello world #wo723mdsf')
    .end(function(err,res){
      res.status.should.equal(400);
      res.body.status.should.equal('error');
      done();
    });
  });

  it("should create a new Queue with ID == 1",function(done){
    test
    .post('/queues')
    .send('name=PracticalQueue')
    .end(function(err,res){
      res.status.should.equal(201);
      res.body.status.should.equal('ok');
      res.body.id.should.equal(1);
      broker.qManager.should.have.lengthOf(2);
      broker.qManager[1].name.should.equal('PracticalQueue');

      // Setup hook for next text below....
      var consumer = require('./../clients/consumer.js')( 1 ,function(msg){
        spoon.collect(msg.content);
      });
      done();
    });
  });


  it("should produce a message - and be received by consumer.",function(done){

    // Spoon lets us neatly integrate with Consumer, so that if it receives our message, it can send us a callback.
    // Ironically, it's like a mini callback pub/sub system in itself.
    spoon.join( data=>(/#irduj@Quo/.test(data.body)), err=>done(err), 2000);

    test
    .post('/queues/1/messages')
    .set('Content-Type', 'text/plain')
    .send('hello world! #irduj@Quo')
    .end(function(err,res){
      res.status.should.equal(200);
      res.body.status.should.equal('ok');

      broker.qManager.should.have.lengthOf(2);
      // Done is called through spoon for us, when the message 'hello world! #irduj@QuodnalA' is received.
    });
  });

});



describe("Consumer Management",function(){

  it("Test number of consumers.",function(done){
    test
    .get('/queues/1/consumers')
    .end(function(err,res){
      res.status.should.equal(200);
      res.body.should.have.lengthOf(1);
      res.body[0].id.should.equal(0);
      res.body[0].queue_id.should.equal(1);
      res.body[0].should.have.property('callback_url').which.is.a.String(); // Unknown port number...

      broker.qManager.should.have.lengthOf(2);
      broker.qManager[1].name.should.equal('PracticalQueue');
      broker.qManager[1].consumers.should.have.lengthOf(1);
      done();
    });
  });

  it("Create a new (but fake & unresponsive) consumer.",function(done){
    test
    .post('/queues/1/consumers')
    .send('callback_url=https://localhost:65000/Made_Up_1')
    .end(function(err,res){
      res.status.should.equal(200);
      res.body.status.should.equal('ok');

      broker.qManager[1].consumers.should.have.lengthOf(2);
      broker.qManager.should.have.lengthOf(2);
      broker.qManager[1].name.should.equal('PracticalQueue');
      done();
    });
  });

  it("Create another new (but fake & unresponsive) consumer.",function(done){
    test
    .post('/queues/1/consumers')
    .send('callback_url=https://localhost:65000/Made_Up_2')
    .end(function(err,res){
      res.status.should.equal(200);
      res.body.status.should.equal('ok');

      broker.qManager[1].consumers.should.have.lengthOf(3);
      broker.qManager.should.have.lengthOf(2);
      broker.qManager[1].name.should.equal('PracticalQueue');
      done();
    });
  });

  it("Get list of consumers.",function(done){
    test
    .get('/queues/1/consumers')
    .end(function(err,res){
      res.status.should.equal(200);
      res.body.should.have.lengthOf(3);

      res.body[0].queue_id.should.equal(1);
      res.body[0].id.should.equal(0);
      res.body[1].queue_id.should.equal(1);
      res.body[1].id.should.equal(1);
      res.body[2].queue_id.should.equal(1);
      res.body[2].id.should.equal(2);

      broker.qManager[1].consumers.should.have.lengthOf(3);
      broker.qManager.should.have.lengthOf(2);
      broker.qManager[1].name.should.equal('PracticalQueue');
      done();
    });
  });

  it("should *NOT* delete consumer #1 - no consumer ID",function(done){
    test
    .delete('/queues/1/consumers/John')
    .end(function(err,res){
      res.status.should.equal(400);
      res.body.status.should.equal('error');

      broker.qManager[1].consumers.should.have.lengthOf(3);
      broker.qManager[1].consumers[1].should.not.equal(undefined);
      broker.qManager.should.have.lengthOf(2);
      broker.qManager[1].name.should.equal('PracticalQueue');
      done();
    });
  });

  it("should *NOT* delete consumer #1 - unmatched consumer ID",function(done){
    test
    .delete('/queues/1/consumers/50')
    .end(function(err,res){
      res.status.should.equal(410);
      res.body.status.should.equal('error');

      broker.qManager[1].consumers.should.have.lengthOf(3);
      broker.qManager[1].consumers[1].should.not.equal(undefined);
      broker.qManager.should.have.lengthOf(2);
      broker.qManager[1].name.should.equal('PracticalQueue');
      done();
    });
  });

  it("should *NOT* delete consumer #1 - wrong Queue",function(done){
    test
    .delete('/queues/50/consumers/1')
    .end(function(err,res){
      res.status.should.equal(410);
      res.body.status.should.equal('error');

      broker.qManager[1].consumers.should.have.lengthOf(3);
      broker.qManager[1].consumers[1].should.not.equal(undefined);
      broker.qManager.should.have.lengthOf(2);
      broker.qManager[1].name.should.equal('PracticalQueue');
      done();
    });
  });

  it("should Delete consumer #1 from Queue#1.",function(done){
    test
    .delete('/queues/1/consumers/1')
    .end(function(err,res){
      res.status.should.equal(200);
      res.body.status.should.equal('ok');

      broker.qManager[1].consumers.should.have.lengthOf(3);
      (broker.qManager[1].consumers[1] === undefined).should.equal(true);

      broker.qManager.should.have.lengthOf(2);
      broker.qManager[1].name.should.equal('PracticalQueue');
      done();
    });
  });

  it("Create another new (but fake & unresponsive) consumer.",function(done){
    test
    .post('/queues/1/consumers')
    .send('callback_url=https://localhost:65000/Made_Up_3')
    .end(function(err,res){
      res.status.should.equal(200);
      res.body.status.should.equal('ok');

      (broker.qManager[1].consumers[1] === undefined).should.equal(true);
      (broker.qManager[1].consumers[1] === undefined).should.equal(true);

      broker.qManager[1].consumers.should.have.lengthOf(4);
      broker.qManager.should.have.lengthOf(2);
      broker.qManager[1].name.should.equal('PracticalQueue');
      done();
    });
  });

  it("Get list of consumers.",function(done){
    test
    .get('/queues/1/consumers')
    .end(function(err,res){
      res.status.should.equal(200);
      res.body.should.have.lengthOf(3);

      res.body[0].queue_id.should.equal(1);
      res.body[0].id.should.equal(0);
      res.body[1].queue_id.should.equal(1);
      res.body[1].id.should.equal(2);
      res.body[2].queue_id.should.equal(1);
      res.body[2].id.should.equal(3);

      broker.qManager[1].consumers.should.have.lengthOf(4);
      broker.qManager.should.have.lengthOf(2);
      broker.qManager[1].name.should.equal('PracticalQueue');
      done();
    });
  });

});
