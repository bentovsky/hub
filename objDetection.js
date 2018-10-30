var http = require('http');
var express = require('express');
var WebSocketClient = require('websocket').client;
var mqtt = require('./models/mqtt');
var tagID = require('./models/tagID');
var io = require('socket.io-client');

var url = 'http://192.168.0.149:3000';
var socket;
socket = io.connect(url);

mqtt.setup('bento','password','localhost',function(mqtt){
    receivingClient=mqtt;
});

mqtt.setup('','','192.168.0.173',function(mqtt){
    sendingClient=mqtt;
});

mqtt.setup('bento','password','localhost',function(mqtt){
    receivingManager=mqtt;
},1885)

//mqtt.subscribe(receivingManager,'configMode');
mqtt.subscribe(receivingClient,'sensor-listing');
mqtt.subscribe(receivingClient,'sensor-receivedValue');
mqtt.subscribe(receivingClient,'sensor-receivedConfig');
mqtt.subscribe(receivingClient,'sensor-receivedAction');
mqtt.subscribe(receivingClient,'sensor-nodeErrors');

//mqtt.message(receivingManager,function(message,topic){
    //if(topic=='configMode'){
        //if(message=='on'){
            // var count=0;
            // mqtt.message(receivingClient,function(message,topic){
            //     var send = message;
            //     if(topic=='sensor-receivedValue'){
            //         message = JSON.parse(message);
            //         var key = Object.keys(message.body);
            //         var finalMatrix = buildmatrix(message.body.matrix,message.body.sizeX,message.body.sizeY)
            //         tagID.countObj(finalMatrix,function(n_objects,details){
            //             console.log(details)
            //             message["body"].metadata=details;
            //             message = JSON.stringify(message);
            //             send=message;
            //         });
            //     }
            //     mqtt.publish(sendingClient,topic,send)
            // });
        //}
        //if(message=='off'){
            var count=0;
            mqtt.message(receivingClient,function(message,topic){
                var send = message;
                if(topic=='sensor-receivedValue'){
                    message = JSON.parse(message);
                    var key = Object.keys(message.body);
                    var matrix = buildmatrix(message.body.matrix,message.body.sizeX,message.body.sizeY)
                    var finalMatrix;
                    tagID.countObj(matrix,function(n_objects,details,finalMatrix){
                        var teste=1
                        console.log('NUMBER OF OBJECTS '+n_objects)
                        console.log(details)
                        console.log(message.body.matrix)
                        console.log('-------------------')
                        final=convert(finalMatrix).toString()
                        console.log(final)
                        console.log('------------------')
                        message["body"].objNumber=n_objects
                        message["body"].metadata=details
                        message["body"].matrix  = final;
                        //socket.emit('teste', {"values": finalMatrix,"count":n_objects});
                        message = JSON.stringify(message);
                        send=message;
                    });
                }
                mqtt.publish(sendingClient,'sensor-receivedValue1',send)
            });
        //}
    //}
        
//});





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

function convert(finalMatrix){

    console.log("FINAL",finalMatrix);

    console.log("Numero de linhas",finalMatrix.length);
    console.log("Numero de colunas",finalMatrix[0].length);
    
    

    var final = [];
    var cont=0;
    for (let i = 0; i < finalMatrix.length; i++) { 
        var teste=[];
        for (let j = 0; j < finalMatrix[0].length; j++) {
            final[cont]=finalMatrix[i][j];
            teste[cont]=final[cont];
            cont++;
        } 
        console.log("linha"+i,teste);
                       
    }
    //console.log(final);


    return final
}


  







