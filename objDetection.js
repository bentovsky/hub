var mqtt = require('mqtt');
var http = require('http');
var express = require('express');
var WebSocketClient = require('websocket').client;
var mqttModel = require('./models/mqtt');
var tagID = require('./models/tagID');


var client = new WebSocketClient();

client.connect('ws://192.168.0.149:3000/', 'echo-protocol');


client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', function(connection) {
    console.log('CONNECTED')
    client.send('HELLO NUNO');
})


mqttModel.setup('bento','password','localhost',function(mqtt){
    receivingClient=mqtt;
},1885);


sendingClient=mqtt.connect('mqtt://192.168.0.173:1883')



mqttModel.subscribe(receivingClient,'sensor-Listing');
mqttModel.subscribe(receivingClient,'sensor-ReceivedValue');
mqttModel.subscribe(receivingClient,'sensor-ReceivedConfig');
mqttModel.subscribe(receivingClient,'sensor-ReceivedAction');
mqttModel.subscribe(receivingClient,'sensor-NodeErrors');


var count=0;
mqttModel.message(receivingClient,function(message,topic){
    if(topic=='sensor-ReceivedValue'){
        
        var key = Object.keys(message);
        var finalMatrix = buildmatrix(message.matrix,message.sizeX,message.sizeY)

        message = JSON.stringify(message).slice(0,-1);

        
         tagID.countObj(finalMatrix,function(n_objects){
            console.log('NUMBER OF OBJECTS '+n_objects)
            message+=', "objNumber":'+n_objects+'}';
            // client.send(message.toString());
            message=JSON.parse(message)
        });

    }
    var send = JSON.stringify(message)
    mqttModel.publish(sendingClient,topic,send)
});




//RECEBER MATRIZ EM STRING1
function buildmatrix(matrix,sizeX,sizeY){
    var finalMatrix = [];
    var count = 0;
    var array = JSON.parse("[" + matrix + "]");
    for (var i = 0; i < sizeX; i++) {
        finalMatrix[i]=[];
        for (var j = 0; j < sizeY; j++) {
            finalMatrix[i][j] = array[count];
            count++;
        }   
    }
    return finalMatrix;

}




  







