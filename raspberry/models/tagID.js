


exports.countObj=function (matrix_,callback) { // propagacao de etiquetas

  var matrix = new Array();
  var posicoes = new Array();
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

    //console.log("Primeiro for: ", matrix)

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

    console.log(matrix)
    //filtering(matrix);

    if (dif.length < n_objects)
      n_objects = dif.length;
    if (!stop) {
      dif = new Array();
    }


  }
  dif.sort(function (a, b) { return a - b });

  console.log("Diferentes", dif);

  console.log("Number of objects: " + n_objects);
 
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
  var erase=[];
  var tmp=[];
  for (let i = 0; i < dif.length; i++) {

    loop1:
    for (let row = 2; row < nline + 2; row++) {

      for (let col = 2; col < ncol + 2; col++) {
        if (matrix[row][col] === dif[i]) {
          
          /****************APAGAR***************** */
          if(calcuteObjectDetails(matrix,row,col).area<6){
            erase.push(dif[i])
          }
          else{
            perObjects[dif[i]]=calcuteObjectDetails(matrix,row,col);
          }
          /****************APAGAR***************** */
          break loop1;
        }
      }
    }
  }

/****************APAGAR***************** */
  console.log(erase);
  n_objects=n_objects-erase.length;
  var finalMatrix=[];

  for (var i = 0; i < 15; i++) {
    finalMatrix[i]=[];
    for (var j = 0; j <= 15; j++) {
      finalMatrix[i][j]=0;
    }
  }

  for (var i = 0; i < 15; i++) {
    for (var j = 0; j < 15; j++) {
      finalMatrix[i][j]=matrix[i][j];
      for (var k = 0; k < erase.length; k++) {
        if(finalMatrix[i][j]==erase[k])
          finalMatrix[i][j]=0;
      }
      if(finalMatrix[i][j]!=0)
        finalMatrix[i][j]=1;
    }
  }

/****************APAGAR***************** */
  console.log(finalMatrix)
  callback(n_objects,perObjects,finalMatrix)


}

function calcutePerInverse(matrix, row, col) {
  var per = 0;
  var origRow = row;
  var origCol = col;
  var i = 0;

  var tag = matrix[row][col];
  var inic = tag;
  matrix[row][col] = '!';
  var stop = false;


  while (!stop) {
    if (i === 30)
      break

    if (tag === inic) {

      if (matrix[row][col - 1] === tag) {//1

        col--;
        per++;
        matrix[row][col] = tag / 2;
      } else {
        if (matrix[row + 1][col - 1] === tag) {//2

          row++;
          col--;
          per++;
          matrix[row][col] = tag / 2;
        } else {
          if (matrix[row + 1][col] === tag) {//3
            row++;
            per++;
            matrix[row][col] = tag / 2;
          }
          else {
            if (matrix[row + 1][col + 1] === tag) {//4
              col++;
              row++;
              per++;
              matrix[row][col] = tag / 2;
            } else {
              if (matrix[row][col + 1] === tag) {//5

                col++;
                per++;
                matrix[row][col] = tag / 2;
              } else {
                if (matrix[row - 1][col + 1] === tag) {//6
                  row--;
                  col++;
                  per++;
                  matrix[row][col] = tag / 2;
                } else {
                  if (matrix[row - 1][col] === tag) {//7
                    row--;
                    per++;
                    matrix[row][col] = tag / 2;
                  } else {
                    if (matrix[row - 1][col - 1] === tag) {//8
                      col--;
                      row--;
                      per++;
                      matrix[row][col] = tag / 2;
                    } else {

                      stop = (matrix[row][col] === '!') ? true : false;
                      if (stop === true) {
                        per++;
                        break;
                      }

                      tag = tag / 2;
                      matrix[row][col] = tag / 2;
                      // break;
                      // stop = true;

                    }
                  }
                }

              }
            }
          }

        }
      }
    }
    else {
      if (matrix[row][col + 1] === tag) {
        col++;
        per++;
        matrix[row][col] = tag / 2;
      } else {
        if (matrix[row + 1][col + 1] === tag) {
          row++;
          col++;
          per++;
          matrix[row][col] = tag / 2;
        } else {
          if (matrix[row + 1][col] === tag) {
            row++;
            per++;
            matrix[row][col] = tag / 2;
          } else {
            if (matrix[row + 1][col - 1] === tag) {
              row++;
              col--;
              per++;
              matrix[row][col] = tag / 2;
            }
            else {
              if (matrix[row][col - 1] === tag) {
                col--;
                per++;
                matrix[row][col] = tag / 2;
              } else {
                if (matrix[row - 1][col - 1] === tag) {
                  col--;
                  row--;
                  per++;
                  matrix[row][col] = tag / 2;
                } else {
                  if (matrix[row - 1][col] === tag) {
                    row--;
                    per++;
                    matrix[row][col] = tag / 2;
                  } else {
                    if (matrix[row - 1][col + 1] === tag) {
                      col++;
                      row--;
                      per++;
                      matrix[row][col] = tag / 2;
                    } else {

                      stop = (matrix[row][col] === '!') ? true : false;
                      if (stop === true) {
                        per++;
                        break;
                      }

                      tag = tag / 2;
                      matrix[row][col] = tag / 2;

                    }
                  }
                }

              }
            }
          }

        }
      }

    }
    if (i > 1) {
      stop = (matrix[row - 1][col - 1] === '!') ? true : false;
      if (stop === true) {
        per++;
        break;
      }

      stop = (matrix[row - 1][col] === '!') ? true : false;
      if (stop === true) {
        per++;
        break;
      }

      stop = (matrix[row - 1][col + 1] === '!') ? true : false;
      if (stop === true) {
        per++;
        break;
      }

      stop = (matrix[row][col + 1] === '!') ? true : false;
      if (stop === true) {
        per++;
        break;
      }

      stop = (matrix[row + 1][col + 1] === '!') ? true : false;
      if (stop === true) {
        per++;
        break;
      }

      stop = (matrix[row + 1][col] === '!') ? true : false;
      if (stop === true) {
        per++;
        break;
      }

      stop = (matrix[row + 1][col - 1] === '!') ? true : false;
      if (stop === true) {
        per++;
        break;
      }

      stop = (matrix[row][col - 1] === '!') ? true : false;
      if (stop === true) {
        per++;
        break;
      }




    }
    i++;
  }
  return per;
}

function calcuteObjectDetails(matrix, row, col) {
  var per = 0;
  var origRow = row;
  var origCol = col;
  var i = 0;
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

function printMatrix(matrix) {

  for (let i = 0; i < matrix.length; i++) {

    console.log(matrix[i]);

  }

}


function filtering(matrix){
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[0].length; j++) {
      if(matrix[i][j]!=0&&(matrix[i-1][j-1]==0&&matrix[i-1][j]==0&&matrix[i-1][j+1]==0&&matrix[i][j-1]==0&&matrix[i][j+1]==0&&matrix[i+1][j-1]==0&&matrix[i+1][j]==0&&matrix[i+1][j+1]==0))
        matrix[i][j]=0;
    }
    
  }
}