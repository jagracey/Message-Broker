
echo -e '\n Empty Queues'
curl localhost:3000/queues

echo -e '\n One Queue'
curl --data "name=queue#0" localhost:3000/queues

echo -e '\n Two Queues'
curl --data "name=queue#1" localhost:3000/queues

echo -e '\n Three Queues'
curl --data "name=queue#2" localhost:3000/queues

echo -e '\n Four Queues'
curl --data "name=queue#3" localhost:3000/queues

echo -e '\n Five Queues'
#curl -H "Content-Type: application/json" -X POST -d '{"name": "queue#4"}' localhost:3000/queues
curl --data "name=queue#4" localhost:3000/queues

echo -e '\n 5 Queues should display'
curl localhost:3000/queues

echo -e '\n delete queue #1'
curl -X "DELETE" localhost:3000/queues/1/

echo -e '\n should show 4 queues, without #1'
curl localhost:3000/queues

echo -e '\n change name of queue #2'
curl -X PUT --data 'name=#2queue' localhost:3000/queues/2/

echo -e '\n 2#queue should have changed names'
curl localhost:3000/queues

echo -e '\n register new consumer to queue #2 with CB from google'
curl --data 'callback_url=http://google.com' localhost:3000/queues/2/consumers

echo -e '\n Get consumers'
curl localhost:3000/queues/2/consumers

echo -e '\n register new consumer to queue #2 with CB from yahoo'
curl --data 'callback_url=http://yahoo.com' localhost:3000/queues/2/consumers

echo -e '\n get consumers with yahoo showing'
curl localhost:3000/queues/2/consumers

echo -e '\n Delete consumer 0, it has a google callback'
curl -X DELETE localhost:3000/queues/2/consumers/0

echo -e '\n show consumers on queue 2'
curl localhost:3000/queues/2/consumers

echo -e '\n Deleting consumer#1 of queue#2'
curl -X DELETE localhost:3000/queues/2/consumers/1

echo -e '\n show empty consumers on queue 2'
curl localhost:3000/queues/2/consumers
