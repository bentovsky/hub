var received="12345;15;0;1,5,7,8";
var received_final="";
var count=0;
var ID="";
var total_lines="";
var current_col;
var values="";
var matrix=[];

received_final=received.split(';');
ID=received_final[0];
total_lines=received_final[1]
current_col=parseInt(received_final[2])
values=received_final[3].split(',');

console.log(received_final);


for (let i = 0; i < total_lines; i++) {
    matrix[i]=0;
    for (let j = 0; j < values.length; j++) {
        if(i==values[j]){
            matrix[i]=1;
            break;
        }
    }    
}


console.log('----------');
console.log(ID);
console.log('----------');
console.log(total_lines);
console.log('----------');
console.log(current_col)
console.log('----------');
console.log(matrix);

function initiate_matrix(matrix){
    for (var i = 0; i < total_lines; i++) {
        matrix[i]=[];
        for (var j = 0; j < 15; j++) {
            matrix[i][j]=0;
        }
    }
}

