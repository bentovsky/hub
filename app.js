var serialport = require('serialport');
var mqtt = require('./models/mqtt');
var mysql = require('./models/mysql');
var client;
var finalJSON = [];
var verifyJSON = [];
var countDB=[];
var getmac = require('getmac')
var msg = [];
var interval=60000;


//JSON com - "values":MATRIZ, "count":NUMERO DE OBJECTOS

//////////////////////////////////////////////
//    INITIALIZE DATABASE AND SERIALPORT    //
//////////////////////////////////////////////


var serial = new serialport('/dev/ttyUSB0', {
    baudRate: 115200,
  });


mqtt.setup('bento','password','localhost',function(mqtt){
    client=mqtt;
},1883);

mqtt.setup('bento','password','localhost',function(mqtt){
    deviceManager=mqtt;
},1885);


mysql.setup('root','','localhost','sensors');


//connectmqtt('data',mqttclient,database);

mqtt.subscribe(deviceManager,'interval');


mysql.dropDB(function(ver){
    if(ver==1){
        countDiff();
    }
});




serial.on("open", function () { 
   console.log('CONNECTED TO SERIAL');
   var node=0;
   var count=0;
   var error = 0;
   var count=0;

    serial.on('error', function(err) {
        console.log('Error: ', err.message);
    })
  
    serial.on('data', function (data) {
        var incoming = data.toString();
        incoming = incoming.replace(/(\r\n|\n|\r)/gm, "");
        incoming = incoming.replace(" ", "");
        msg += incoming;
        var out =isOverSending();
        if (out.value) {
            console.log(out.msg)
            msgJSON = JSON.parse(out.msg);
            console.log('--------------------')
            console.log(msgJSON)
            if(searchJSON(msgJSON,verifyJSON)==0){
                initiateVerify(verifyJSON,msgJSON.node);
                initiateMatrix(finalJSON,msgJSON);
                node=msgJSON.node;
            }
            if(msgJSON.sensors[0].values.length!=0){
                var values = msgJSON.sensors[0].values;
                var position = parseInt(msgJSON.sensors[0].name.slice(3));
                updateMatrix(finalJSON,msgJSON.node,values,position);
            }
            var index=getKeyIndex(msgJSON.node)
            verifyJSON[index].count=verifyJSON[index].count+1
            console.log(verifyJSON)
            //NUMBER OF COLUMNS
            if(verifyJSON[index].count==49){
                console.log(finalJSON[0]);
                var matrix = finalJSON[0].sensor[0].matrix;

                mysql.addToDB(finalJSON,matrix,function(inserted){
                    if (inserted==1){                            
                        console.log('ADDED TO DB');
                    }
                });

                verifyJSON[index].count=0
            }
            msg = "";
        }

    });
});


function isOverSending() {
    var count=0;
    var out={};
    if (msg[0] === '{') {
      for (let i = 0; i < msg.length; i++) {
        const element = msg[i];
  
        if(msg[i]==='{')
          count++;
        if(msg[i]==='}')
          count--;
        
          if (count===0) {
            console.log(msg[i])
            out.msg=msg.slice(0,i+1);
            out.value=true;
            msg=msg.slice(i+1);
            return out;        
          }
      }
    }
    else {
      msg = "";
      out.value=false;
      return out;
    }
    
      out.value=false;
      return out;
  
  }


function searchJSON(msgJSON,verifyJSON){
    for (var i = 0; i < verifyJSON.length; i++) {
        if(verifyJSON[0].node==msgJSON.node)
            return 1;
    }
    return 0;
}

function getKeyIndex(key) {
    var found = null;
    for (var i = 0; i < verifyJSON.length; i++) {
        var element = verifyJSON[i];

        if (element.node == key) {
            return i;
       } 
    }
}

function initiateVerify(verifyJSON,node){

    verifyJSON.push({
        "node":node,
        "count":1
    });
}


function initiateMatrix(indexJSON,msgJSON){
    var matrix = [];
    //MATRIX SIZE [I][J]
    for (var i = 0; i < 50; i++) {
        matrix[i]=[];
        for (var j = 0; j < 50; j++) {
            matrix[i][j]=0
        }
    }
    //CREATE JSON
    var action=[];
    var config=[];
    var sensor=[];

    action.push({
        "name":msgJSON.actions[0].name,
        "values":msgJSON.actions[0].value
    });
    config.push({
        "name":msgJSON.configs[0].name,
        "values":msgJSON.configs[0].value
    });

    sensor.push({
        "name":"velostat",
        "matrix":matrix
    });

    finalJSON.push({
        "node":msgJSON.node,
        "sensor":sensor,
        "action":action,
        "config":config
    });
    
}

function updateMatrix(finalJSON,node,values,position){

    var cont = 0;
    while(cont){
        if(finalJSON[cont].node==node)
            break;
        cont++;
    }  
    var matrix = finalJSON[cont].sensor[0].matrix;
    for (var i = 0; i < values.length; i++) {
        matrix[values[i]][position]=1
    }
}

 

//CONECTAR AO MQTT ------- QUANDO FECHO A LIGAÇAO??
function connectmqtt(topic){
    var i=0;
    mqtt.subscribe(client,topic)
    var timer = setInterval(function(){
        if(!client.connected){
            console.log('CONNECTING');
            
            if(i==10){
                console.log('MQTT TIMEOUT');
                process.exit();
            }   
            i=i+1;
        }
        if(client.connected){
            clearInterval(timer);
        }
    },60000); 
}

//ENVIAR DADOS POR MQTT

function countDiff(){
    var countDB=[];
    mysql.getCount(function(ver,initialArray){
        if(ver==1){
            //console.log(initialArray)
            countDB=initialArray;
        }
    })
    

    var timer_emit = setInterval(timer,interval);
    mqtt.message(deviceManager,function(message,topic){
        if(topic=='interval'){
            console.log('ENTROU--------------------')
            clearInterval(timer_emit);
            interval=parseInt(message)*1000;
            console.log(interval)
            timer_emit = setInterval(timer,interval);
        }
    })
    
}



function timer(){
    var compare1=0;
    var compare2=0;
    var first=1;
    var keyValues=[];
    mysql.getCount(function(ver,arrayCount){
        mysql.isEmpty(function(isEmpty){
            if(ver==1){
                if(first==1){
                    for (var i = 0; i < arrayCount.length; i++) {
                        keyValues.push(Object.keys(arrayCount[i][0]))
                    }
                    first=0;
                }

                if(countDB.length!=0){
                    console.log('AFTER')
                    for (var i = 0; i < arrayCount.length; i++) {
                        compare1=arrayCount[i][0][keyValues[i]];
                        compare2=countDB[i][0][keyValues[i]];
                        console.log('COMPARE1 - '+compare1)
                        console.log('COMPARE2 - '+compare2)
                        emit(compare1,compare2,keyValues[i]);
                    }
                    countDB = arrayCount;
                } 

                if(countDB.length==0){
                    console.log('MATRIX IS STILL EMPTY')
                    for (var i = 0; i < arrayCount.length; i++) {
                        compare1=arrayCount[i][0][keyValues[i]];
                        emit(compare1,0,keyValues[i]);
                    }
                    countDB = arrayCount;
                }
            }
        })
    })
}

function emit(compare1,compare2,keyValue){
    var compareRow = Math.abs(compare1 - compare2);
    var topic="sensor-"+keyValue
    mysql.convertTableToJSON(keyValue,function(result){
        //console.log(result)
        console.log('COMPARE ONE  '+compare1);
        console.log('COMPARE TWO  '+compare2);
        console.log(compareRow)    
        if(compareRow==0&&result.value.length!=0){
            for (var i = 0; i < compare1; i++) {
                var sendUpdate ={};
                sendUpdate["command"]='update table '+keyValue;
                sendUpdate["body"]=result.value[i]
                //sendUpdate["table"]=keyValue;
                mqtt.publish(client,topic,JSON.stringify(sendUpdate))
            }
        }
        if(compareRow!=0){
            for (var i = compare1-1; i > compare2-1; i--) {
                console.log('insert')
                var sendInsert = {};
                sendInsert["command"]='insert table '+keyValue;
                sendInsert["body"]=result.value[i];
                //sendInsert["table"]=keyValue;

                console.log('--------------------------')
                console.log(JSON.stringify(sendInsert))
                console.log('--------------------------')
                console.log(sendInsert)
                console.log('--------------------------')
                mqtt.publish(client,topic,JSON.stringify(sendInsert));
                if(Object.keys(sendInsert.body)[0]=='receivedValueID'){
                    mysql.dropTable('receivedValue');
                    countDB = [];
                }
            }
            // for (var i = compare2-1; i >=0; i--) {
            //     console.log('update')
            //     // console.log(i)    
            //     var sendUpdate = result.value[i]
            //     sendUpdate["action"]='update table '+keyValue;
            //     console.log('--------------------------')
            //     console.log(sendUpdate)
            //     console.log('--------------------------')
            //     mqtt.publish(topic,mqttclient,JSON.stringify(sendUpdate))
            // }
        }
    });
    }


function sendMac(){
    getmac.getMac(function(err, macAddress){
        if (err)  throw err
            var details=[];
            details.push({
                "location":"supermarket X",
                "macAddress":macAddress
            });            
            mqtt.publish(client,'hubDetails',JSON.stringify(details));
    })    
}


function splitJSON(received){
    var listingJSON = [];
    var errorsJSON = [];
    var configJSON = [];
    var actionJSON = [];
    var valuesJSON = [];

    listingJSON.push({
        "name":received[0].table,
        "value":received[0].value
    });

    errorsJSON.push({
        "name":received[1].table,
        "value":received[1].value
    });

    configJSON.push({
        "name":received[2].table,
        "value":received[2].value
    });

    actionJSON.push({
        "name":received[3].table,
        "value":received[3].value
    });

    valuesJSON.push({
        "name":received[4].table,
        "value":received[4].value
    });

    console.log(listingJSON[0]);
    console.log(errorsJSON[0]);
    console.log(configJSON[0]);
    console.log(actionJSON[0]);
    console.log(valuesJSON[0]);
}