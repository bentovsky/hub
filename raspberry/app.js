mysql = require('./models/mysql');
mqtt = require('./models/mqtt');
var serialport = require('serialport');



var received="12345;15;0;1,5,7,8";
var received_final="";

var ID="";
var initialID=11111;

var total_lines="";
var current_col;
var col_array=[];
var col=0;

var values="";

var matrix=[];
var final_matrix=[];

var received_json={
    "nodeID":0,
    "sizeX": 0,
    "sizeY": 0,
    "initial_value": -1,
    "counter": -1,
    "matrix": ""
};
var final_json=[];
var countDB = [];
var first_value=true;

//SETUP SERIAL

var serial = new serialport('/dev/ttyUSB0', {
    baudRate: 115200,
  });

//SETUP DATABASE

mysql.setup('bento','','localhost','sensors');

mysql.dropDB(function(ver){
    if(ver==1){
        countDiff();
    }
});

//SETUP MQTT CONNECTION

mqtt.setup('','','localhost',function(mqtt){
    client=mqtt;
},1883);

connectmqtt(client,'interval');

sendMQTT(client);

serial.on("open", function () {
    console.log('CONNECTED TO SERIAL');
    var buffer = '';
    var received='';
    var count=0;
    var first = true;

    serial.on('error', function(err) {
        console.log('Error: ', err.message);
    });
    serial.on('data', function (data) {
        var incoming = [];
        var verify = [];
        incoming = data.toString();
        //console.log(incoming);

        verify = incoming.split(';');
        if(first) {
            if(incoming.split(';')[0].search(',')==-1 && incoming.split(';')[0].length>5){
                buffer += incoming;
                first = false;
            }
        }
        else
            buffer += incoming;

        for (let i = 0; i < buffer.length; i++) {
            if(buffer[i]==';') {
                count++;
            }
            if(count == 4) {
                console.log('SEND',received);
                receive_value(received);
                received='';
                count=0;
                buffer=buffer.substr(i+1);
                break;
            }
            received+=buffer[i];
        }
        count=0;
        received='';
    });
});
// var send='';
// var col=0;
// setInterval(function(){
//     send = '2134798286;15;'+col+';0,1,2,3,4,5,6,7,8,9,10,11,12,13,1';
//     col++;
//     if(col==14)
//         col=0;
//     receive_value(send);
// },1000)


function receive_value(received){

    received_final=received.split(';');
    console.log('RECEIVED FINAL: ',received_final);

    ID=received_final[0];
    received_json.nodeID=ID;

    //INITIATE FINAL_JSON ARRAY
    addJSONtoArray(received_json,final_json);

    //POSITION OF NODE IN FINAL_JSON ARRAY
    var index = searchJSON(received_json,final_json);
    console.log('parse: ', received_final[1]);

    total_lines=parseInt(received_final[1]);
    final_json[index].sizeY=total_lines;

    current_col=parseInt(received_final[2]);
    // final_json[index].counter=current_col + 1;
    final_json[index].counter=current_col;

    //COUNT THE NUMBER OF COLUMNS
    if( final_json[index].counter>final_json[index].sizeX){
        final_json[index].sizeX=final_json[index].counter;
        console.log(final_json[index].sizeX);
    }
    console.log('DEBUG - ', final_json[index].initial_value, final_json[index].counter);

    //COMPLETED MATRIX (BY COLUMNS)
    if (final_json[index].initial_value==final_json[index].counter) {
        first_value=true;
        //REMOVES THE LAST COMMA
        console.log('MATRIX: ',matrix);

        matrix=matrix.slice(0,-1);

        final_json[index].matrix=matrix;
        matrix=[];
        console.log(final_json[index]);
        build_matrix(final_json[index].matrix,final_json[index].sizeX,final_json[index].sizeY);

        //INSERT RECEIVED VALUES ON DATABASE
        mysql.addToDB(final_json[index],function (inserted) {
            if(inserted==1) {
                console.log('ALL VALUES ADDED TO DB');
            }
        })
    }

    //FIRST COLUMN RECEIVED
    if(first_value){
        first_value=false;
        console.log(first_value);
        final_json[index].initial_value=current_col;
        console.log( final_json[index].initial_value);

    }

    values=received_final[3].split(',');

    //CREATE AN ARRAY WITH COLUMN VALUES
    console.log('lines', total_lines);
    
    for (let i = 0; i < total_lines; i++) {
        col_array[i]=0;
        for (let j = 0; j < values.length; j++) {
            if(i==values[j] && values[0]!=''){
                col_array[i]=1;
                break;
            }
        }
    }

    matrix += col_array + ',';
    console.log(matrix);
    

}

//ADD JSON TO ARRAY IF DOESN'T EXIST
function addJSONtoArray(received_json,json_array) {

    var copy_json = JSON.parse(JSON.stringify(received_json))

    if(searchJSON(received_json,json_array)==-1){
        json_array.push(copy_json);
    }
}

//SEARCH BY NODE
function searchJSON(received_json,final_json){
    for (var i = 0; i < final_json.length; i++) {
        if(final_json[i].nodeID==received_json.nodeID){
            return i;
        }
    }
    return -1;
}



function connectmqtt(client, topic){
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
    },1000);
}



//CREATES TIMER TO EMIT DATA. A MESSAGE IN INTERVAL TOPIC WILL CHANGE THE TIMER'S INTERVAL
function sendMQTT(client) {
    var timer_emit = setInterval(timer,20000);
    mqtt.message(client,function(message,topic){
        if(topic=='interval'){
            clearInterval(timer_emit);
            interval=parseInt(message)*1000;
            console.log(interval)
            timer_emit = setInterval(timer,interval);
        }
    });
}


function timer(){
    var compare1=0;
    var compare2=0;
    var first=1;
    var keyValues=[];
    console.log('TIMER')
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
        });
    });
}


function emit(compare1,compare2,keyValue){
    var compareRow = Math.abs(compare1 - compare2);
    var topic="sensor-"+keyValue
    mysql.convertTableToJSON(keyValue,function(result){
        if(compareRow==0&&result.value.length!=0){
            for (var i = 0; i < compare1; i++) {
                var sendUpdate ={};
                sendUpdate["command"]='update table '+keyValue;
                sendUpdate["body"]=result.value[i]
                //sendUpdate["table"]=keyValue;
                mqtt.publish(client,topic,JSON.stringify(sendUpdate))
                console.log('ENVIOU')
            }
        }
        if(compareRow!=0){
            for (var i = compare1-1; i > compare2-1; i--) {
                // console.log('insert')
                var sendInsert = {};
                sendInsert["command"]='insert table '+keyValue;
                sendInsert["body"]=result.value[i];
                //sendInsert["table"]=keyValue;

                // console.log('--------------------------')
                // console.log(JSON.stringify(sendInsert))
                // console.log('--------------------------')
                // console.log(sendInsert)
                // console.log('--------------------------')
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


function countDiff(){
    mysql.getCount(function(ver,initialArray){
        if(ver==1){
            countDB=initialArray;
        }
    })
}

//CONVERTS COLUMNS IN ROWS
function build_matrix(matrix,sizeX,sizeY) {
    var split_matrix=matrix.split(',');
    console.log(sizeX,sizeY);
    
    for (let i = 0; i < split_matrix.length; i++) {
        for (let j = 0; j < split_matrix[i].length; j++) {
            split_matrix[i][j]=parseInt(split_matrix[i]);
        }
    }
    
    for (let i = 0; i < sizeY; i++) {
        final_matrix[i]=[]
        for (let j = 0; j < sizeX; j++) {
            final_matrix[i][j]=0;
        }
    }
    
    for (let i = 0; i < sizeX; i++) {
        for (let j = 0; j < sizeY; j++) {
            final_matrix[j][i]=split_matrix.shift();
        }
    }
    console.log(final_matrix);
}
