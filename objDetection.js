var mqtt = require('./models/mqtt');
var tagID = require('./models/tagID');

mqtt.setup('','','localhost',function(mqtt){
    receivingClient=mqtt;
});

mqtt.setup('','','192.168.0.173',function(mqtt){
    sendingClient=mqtt;
});

// mqtt.setup('','','localhost',function(mqtt){
//     sendingClient=mqtt;
// },1885);

mqtt.subscribe(receivingClient,'sensor-listing');
mqtt.subscribe(receivingClient,'sensor-receivedValue');

mqtt.message(receivingClient,function(message,topic){
    
    if(topic=='sensor-receivedValue') {
        var values_json = JSON.parse(message);var count=0;
        
        var final_matrix = build_matrix(values_json.body);
        console.log(final_matrix);
        var sizeY = values_json.body.sizeY;
        var sizeX = values_json.body.sizeX;
        //OBJECT DETECTION
        tagID.countObj(final_matrix,function(n_objects,details,matrix){
            console.log('SizeX:',sizeX,' SizeY:',sizeY);            
            var final_data={};
            final_data = filterObj(matrix,sizeX,sizeY,details,n_objects);
            console.log('FINAL',final_data);
            
            values_json["body"].objNumber = final_data.n_objects;
            console.log('OBJ',final_data.n_objects);
            
            values_json["body"].metadata = details;
            values_json["body"].matrix  = final_data.matrix;
            console.log('-----------------');
            console.log(values_json.body);
            var send = (JSON.stringify(values_json));
            mqtt.publish(sendingClient,'sensor-receivedValue1',send);
        });
    }
});


//CONVERTS STRING TO MATRIX AND COLUMNS IN ROWS
function build_matrix(received_json) {

    var matrix=[];
    var split_matrix=received_json.matrix.split(',');
    for (let i = 0; i < split_matrix.length; i++) {
        split_matrix[i]=parseInt(split_matrix[i]);
    }

    initiate_matrix(matrix,received_json.sizeX,received_json.sizeY);
    
    for (let i = 0; i < received_json.sizeX; i++) {
        for (let j = 0; j < received_json.sizeY; j++) {
            matrix[j][i]=split_matrix.shift();
        }
    }
    return matrix;

}

//FILTER THE NUMBER OF OBJECTS. DELETE THIS AFTER THE PHYSICAL MATRIX IS READY.
function filterObj(matrix,sizeX,sizeY,details,n_objects){
    var keys=Object.keys(details);
    var removed_keys=[];
    var final_data={};
    for (let i = 0; i < keys.length; i++) {
        //REMOVE OBJECT IF IT IS SMALLER THAN THIS AREA
        if (details[keys[i]].area < 10) {
            delete details[keys[i]];
            removed_keys.push(keys[i]);
            n_objects--;
        }
    }

    matrix = remove_margins(matrix,sizeX,sizeY);
    update_matrix(removed_keys,matrix);
    console.log('MATRIX: ', matrix);
    
    matrix = matrix_to_string(matrix);
    final_data.matrix=matrix.slice(0);
    final_data.n_objects=n_objects;
    console.log('AQUI', final_data);
    
    return final_data;
}

//UPDATE THE MATRIX AFTER REMOVING UNWANTED VALUES
function update_matrix(removed_keys,matrix) {
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            for (let k = 0; k < removed_keys.length; k++) {
                if (matrix[i][j]==removed_keys[k]) {
                    matrix[i][j]=0;
                }
            }
            if (matrix[i][j]!=0)
                matrix[i][j]=1;
        }
    }
}

//REMOVE MATRIX'S MARGINS
function remove_margins(matrix,sizeX,sizeY) {    
    var no_margin_matrix=[];    
    initiate_matrix(no_margin_matrix,sizeX,sizeY);
    console.log('INITIATE',no_margin_matrix);
    for (let i = 0; i < no_margin_matrix.length; i++) {
        for (let j = 0; j < no_margin_matrix[i].length; j++) {
            no_margin_matrix[i][j]=matrix[i+2][j+2]
        }
    }
    // console.log('REMOVED',no_margin_matrix);
    return no_margin_matrix;
}


function matrix_to_string(matrix){
    var string_matrix = [];
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            string_matrix.push(matrix[i][j]);
        }
    }
    string_matrix = string_matrix.toString();
    return string_matrix;
}

function initiate_matrix(matrix, sizeX,sizeY){
    for (let i = 0; i <= sizeY; i++) {
        matrix[i]=[]
        for (let j = 0; j <= sizeX; j++) {
            matrix[i][j]=0;
        }
    }
}