var mqtt = require('./models/mqtt');
var received = [];
var client;
mqtt.setup('bento','password','localhost',function(mqtt){
    receiveingClient=mqtt;
},1883);

mqtt.subscribe(receiveingClient,'sensor-Listing');
mqtt.subscribe(receiveingClient,'sensor-ReceivedValue');
mqtt.subscribe(receiveingClient,'sensor-ReceivedConfig');
mqtt.subscribe(receiveingClient,'sensor-ReceivedAction');
mqtt.subscribe(receiveingClient,'sensor-NodeErrors');


mqtt.message(receiveingClient,function(message,topic){
    if(topic=='sensor-ReceivedValue'){
        //ADD OBJECT DETECTION FUNCTION
        received.push({
            message,
            "ObjNumber":4
        });
        console.log(received)
    }
});






