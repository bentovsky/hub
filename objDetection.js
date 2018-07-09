var mqtt = require('./models/mqtt');
var tagID = require('./models/tagID');



mqtt.setup('bento','password','localhost',function(mqtt){
    receivingClient=mqtt;
},1883);

mqtt.setup('bento','password','localhost',function(mqtt){
    sendingClient=mqtt;
},1883);

mqtt.subscribe(receivingClient,'sensor-Listing');
mqtt.subscribe(receivingClient,'sensor-ReceivedValue');
mqtt.subscribe(receivingClient,'sensor-ReceivedConfig');
mqtt.subscribe(receivingClient,'sensor-ReceivedAction');
mqtt.subscribe(receivingClient,'sensor-NodeErrors');


var count=0;
mqtt.message(receivingClient,function(message,topic){
    if(topic=='sensor-ReceivedValue'){
        
        var key = Object.keys(message);
        var finalMatrix = buildmatrix(message.matrix,message.sizeX,message.sizeY)

        message = JSON.stringify(message).slice(0,-1);

        
         tagID.countObj(finalMatrix,function(n_objects){
            console.log('NUMBER OF OBJECTS '+n_objects)
            message+=', "objNumber":'+n_objects+'}';
            message=JSON.parse(message)

        });
    }
    var send = JSON.stringify(message)
    console.log(send);
    mqtt.publish(sendingClient,'data',send)

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




  







