#Message Broker Project

node version 5.5.0

- Consumer simply needs to respond with a 2XX status code, doesn't read text.
- Each Queue gets its own queue data structure.
- Failed consumer requests get put back in the beggining of the queue- without a minimum delay. MAX_REQUEST_RETRIES is set to Infinity.
- Callback_URL is not validated as a URL

*I haven't done sufficient unit testing or integration testing.*
