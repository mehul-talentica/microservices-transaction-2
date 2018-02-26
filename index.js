"use strict";
const express = require('express');
const bodyParser = require('body-parser');
const mongoose   = require('mongoose');
const amqp = require('amqplib/callback_api');
const logger = require('./logger');
const User = require('./models/user');

amqp.connect('amqp://localhost', function(err, conn) {
  conn.createChannel(function(err, ch) {
    const transactionQueue = 'rpc_request_queue2';
    ch.assertQueue(transactionQueue, {durable: true});
    ch.prefetch(1);
    logger.log('Transaction 2 Microservice - awaiting RPC requests');
    ch.consume(transactionQueue, function (msg) {
      logger.log('Transaction 2 Microservice - consuming Request');
      let userObj = JSON.parse(msg.content);
      console.log(userObj);
      if(parseInt(msg.properties.correlationId) % 2 === 0){
        logger.log('Transaction 2 Microservice - In error block');
        ch.sendToQueue(msg.properties.replyTo, new Buffer(msg.content), {correlationId: msg.properties.correlationId});
        ch.ack(msg);
      } else {
        logger.log('Transaction 2 Microservice - In success block');
        User.create(userObj, function (err, user) {
          if(err) console.log(err.message);
          ch.sendToQueue(msg.properties.replyTo, new Buffer("Success"), {correlationId: msg.properties.correlationId});
          ch.ack(msg);
        });
      }
    });
  });
});

const SERVER_PORT = process.env.SERVER_PORT || 8080;

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/transaction-2-db'); // connect to our database
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.listen(SERVER_PORT, () => {
  logger.log("Transaction 2 micro service started listening on port" + SERVER_PORT);
});
