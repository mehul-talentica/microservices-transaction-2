const amqp = require('amqplib/callback_api');

const log = function(message){
    amqp.connect('amqp://localhost', function(err, conn) {
        conn.createChannel(function(err, ch) {
            const loggerQueue = 'rpc_logger';
            ch.sendToQueue(loggerQueue, new Buffer(message), { persistent: true });
        });
    });
}
module.exports = {
    log
}