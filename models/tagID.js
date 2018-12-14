
var actions = []; // array to store clients the client object to store is up to you to define
var action = {};

action.name = "led";
action.value = "on";
action.node = '2134509702';
actions.push(action);

exports.countObj=function (matrix_,callback) { // propagacao de etiquetas

    var matrix = new Array();
    var stop = false;
    var dif = new Array();

    for (let i = 0; i < matrix_.length; i++) {
        matrix.push(matrix_[i].slice());
    }
    var nline = matrix.length;
    var ncol = matrix[0].length;

    var n_objects = 1000000;
    var add = 0;

    matrix = doubleMargin(matrix.slice());
    var s = "";
    for (let row = 2; row < nline + 2; row++) {

        for (let col = 2; col < ncol + 2; col++) {

            if (matrix[row][col] === 1) {
                matrix[row][col] += add;
                add++;
            }
        }
    }
  //_____________________________
    while (!stop) {
        stop = true;
        for (let row = 2; row < nline + 2; row++) {

            for (let col = 2; col < ncol + 2; col++) {

                if (matrix[row][col] !== 0) {
                    var neigh = [matrix[row][col], matrix[row - 1][col - 1], matrix[row - 1][col], matrix[row - 1][col + 1], matrix[row][col + 1], matrix[row + 1][col + 1], matrix[row + 1][col], matrix[row + 1][col - 1], matrix[row][col - 1]]
                    for (var i = neigh.length - 1; i >= 0; i--) {
                        if (neigh[i] === 0) {
                            neigh.splice(i, 1);
                        }
                    }
                    var min = Math.min.apply(Math, neigh)
                    if (min !== matrix[row][col]) {
                        matrix[row][col] = min;
                        stop = false;
                    }
                    if (dif.indexOf(matrix[row][col]) === -1) {
                        dif.push(matrix[row][col]);
                }
                }
            }
        }

        if (dif.length < n_objects)
            n_objects = dif.length;

        dif = new Array();

        for (let row = nline + 2; row >= 2; row--) {

            for (let col = ncol + 2; col >= 2; col--) {
                if (matrix[row][col] !== 0) {
                    var neigh = [matrix[row][col], matrix[row - 1][col - 1], matrix[row - 1][col], matrix[row - 1][col + 1], matrix[row][col + 1], matrix[row + 1][col + 1], matrix[row + 1][col], matrix[row + 1][col - 1], matrix[row][col - 1]]
                    for (var i = neigh.length - 1; i >= 0; i--) {
                        if (neigh[i] === 0) {
                            neigh.splice(i, 1);
                        }
                    }
                    var min = Math.min.apply(Math, neigh)
                    if (min !== matrix[row][col]) {
                        matrix[row][col] = min;
                        stop = false;
                    }

                    if (dif.indexOf(matrix[row][col]) === -1) {
                        dif.push(matrix[row][col]);
                    }
                }
            }
        }
        if (dif.length < n_objects)
            n_objects = dif.length;
        if (!stop) {
            dif = new Array();
        }

    }

    dif.sort(function (a, b) { return a - b });

    console.log("Diferentes", dif);

    console.log("Number of objects: " + n_objects);

    console.log(matrix);
    var aux = new Array();
        for (let i = 0; i < matrix.length; i++) {
        aux.push(matrix[i].slice());
    }
    var perObjects = {};


    matrix = aux;

    var aux = new Array();
    for (let i = 0; i < matrix.length; i++) {
        aux.push(matrix[i].slice());
    }

    for (let i = 0; i < dif.length; i++) {

        loop1:
        for (let row = 2; row < nline + 2; row++) {

            for (let col = 2; col < ncol + 2; col++) {
                if (matrix[row][col] === dif[i]) {
                    perObjects[dif[i]] = calcuteObjectDetails(matrix,row,col);
                    break loop1;

                }
            }
        }
    }

    console.log(perObjects);
    callback(n_objects,perObjects,matrix)
}


function calcuteObjectDetails(matrix, row, col) {
    var origRow = row;
    var origCol = col;
    var count=0;
    var nline = matrix.length;
    var ncol = matrix[0].length;
    var tag = matrix[row][col];
    var maxCol=0;
    var maxRow=0;
    var area =0;

    for (let row = 2; row < nline - 2; row++) {
        for (let col = 2; col < ncol - 2; col++) {
            if(matrix[row][col] === tag && (matrix[row - 1][col - 1] === 0 || matrix[row - 1][col] === 0 || matrix[row - 1][col + 1] === 0 || matrix[row][col + 1] === 0 || matrix[row + 1][col + 1] === 0 || matrix[row + 1][col] === 0 || matrix[row + 1][col - 1] === 0 || matrix[row][col - 1] === 0)){
                count++;
                if(row>maxRow)
                maxRow=row;
                if (col>maxCol)
                maxCol=col;
            }
            if (matrix[row][col] === tag) {
                area++;
            }
        }
    }

    var areaCaixaEnvolvente = (maxRow- origRow+1)*(maxCol-origCol+1);
    var caracteristicas={};
    caracteristicas.per=count;
    caracteristicas.areaCaixaEnvolvente=areaCaixaEnvolvente;
    caracteristicas.area=area;
    caracteristicas.fatorForma=(Math.PI*area*4)/(Math.pow(count,2));
    return caracteristicas;
}

function doubleMargin(matrix) {

    var leng = matrix[0].length;

    var aux = new Array();

    for (var i = 0; i < leng; i++) {
        aux.push(0);
    }
    matrix.push(aux.slice(0));

    matrix.push(aux.slice(0));
    matrix.unshift(aux.slice(0));
    matrix.unshift(aux.slice(0));

    for (let i = 0; i < matrix.length; i++) {
        matrix[i].push(0);
        matrix[i].push(0);
        matrix[i].unshift(0);
        matrix[i].unshift(0);
    }
    return matrix;
}
