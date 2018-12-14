
var mqtt = require('mqtt');

/**
* @desc Setup for the mqtt connection 
* @param {string} user mqtt connection's user
* @param {string} pwd user's password
* @param {string} host mqtt connection's host
* @param {int} port port used for the mqtt connection.If this field is not specified,the default port will be used 
* @callback callback
*/
exports.setup = function(user,pwd,host,callback,port){

  if (port==undefined)
    port=1883; //MQTT DEFAULT PORT
  var opti={
    cmd: 'connect',
    protocolId: 'MQTT', // Or 'MQIsdp' in MQTT 3.1
    protocolVersion: 4, // Or 3 in MQTT 3.1
    clean: true, // Can also be false
    clientId: Math.random(),
    keepalive: 0, // Seconds which can be any positive number, with 0 as the default setting
    username: user,
    password: new Buffer(pwd) // Passwords are buffers
   }
  
  var client = mqtt.connect('mqtt://'+host+':'+port,opti);
  callback(client);
}

/**
* @desc Subscribes to a specified topic
* @param {string} topic topic in which the connection will be subcribed
* @param {object} client object with the connection information
*/

 exports.subscribe = function(client,topic){
    client.on('error', function(){
      console.log('\n WRONG USERNAME AND/OR PASSWORD \n');
      client.end();
      process.exit();

    })
    client.on('connect', function () {
        client.subscribe(topic);
        console.log("SUBSCRIBED TO "+topic);
      });
  }

/**
* @desc Publish message in a sppecific topic 
* @param {string} topic topic in which the message will be published
* @param {object} client object with the connection information
* @param {string} message message that will be published 
*/
  exports.publish = function(client,topic,message){
    console.log(message+'\n \n')
    client.publish(topic,message);
  }

/**
 * 
 * @desc Get published message
 * @param {object} client object with the connection information
 */
  exports.message = function(client,callback){    
    client.on('message', (topic, message) => {
      var received = message.toString();
      callback(received,topic);
    })
}