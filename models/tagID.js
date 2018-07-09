


exports.countObj = function (matrix_,callback) { // propagacao de etiquetas

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
  
  
      if (dif.length < n_objects)
        n_objects = dif.length;
      if (!stop) {
        dif = new Array();
      }
  
  
  
  
      //console.log("Segundo for: ", matrix)
  
  
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
  
  
    for (let i = 0; i < dif.length; i++) {
  
      loop1:
      for (let row = 2; row < nline + 2; row++) {
  
        for (let col = ncol + 2; col >= 2; col--) {
          if (matrix[row][col] === dif[i]) {
            perObjects[dif[i]] = calcutePerNormal(matrix, row, col);
            console.log(dif[i], "- Normal:", perObjects[dif[i]]);
            break loop1;
  
          }
        }
      }
    }
  
  
    matrix = aux;
  
    for (let i = 0; i < dif.length; i++) {
      loop2:
      for (let row = 2; row < nline + 2; row++) {
  
        for (let col = ncol + 2; col >= 2; col--) {
          if (matrix[row][col] === dif[i]) {
            var per = calcutePerInverse(matrix, row, col);
            console.log(dif[i], "- Inverted:", per);
  
            if (perObjects[dif[i]] < per) {
              perObjects[dif[i]] = per;
            }
  
            break loop2;
  
          }
        }
      }
    }

  callback(n_objects);

}



function doubleMargin(matrix) {

    var leng = matrix[0].length;
    //console.log("TAMANHAO "+leng);
  
    var aux = new Array();
  
    for (var i = 0; i < leng; i++) {
      aux.push(0);
  
    }
    matrix.push(aux.slice(0));
  
    //console.log("TAMANHo1 "+aux.length);
    matrix.push(aux.slice(0));
    matrix.unshift(aux.slice(0));
    //console.log("TAMANHo2 "+aux.length);
    matrix.unshift(aux.slice(0));
  
    for (let i = 0; i < matrix.length; i++) {
      matrix[i].push(0);
      matrix[i].push(0);
      matrix[i].unshift(0);
      matrix[i].unshift(0);
    }
    return matrix;
  }
  


  function calcutePerNormal(matrix, row, col) {
    var per = 0;
    var origRow = row;
    var origCol = col;
    var i = 0;
  
    var tag = matrix[row][col];
    var inic = tag;
    matrix[row][col] = '!';
    var stop = false;
  
  
  
  
    // console.log("tag", tag);
  
    while (!stop) {
      if (i === 30)
        break
      // console.log(matrix);
      // console.log("PER", per);
  
      if (tag === inic) {
        // console.log("Tag inicial", tag);
        // console.log("OLA1");
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
        // console.log("Tag dividida", tag);
  
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
      if (i > 1) {
        //console.log("OLA2");
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
    console.log(matrix);
    // per++;
    return per;
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
  
  
  
  
    // console.log("tag", tag);
  
    while (!stop) {
      if (i === 30)
        break
      // console.log(matrix);
      // console.log("PER", per);
  
      if (tag === inic) {
        // console.log("Tag inicial", tag);
        // console.log("OLA1");
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
        // console.log("Tag dividida", tag);
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
      if (i > 1) {
        //console.log("OLA2");
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
    console.log(matrix);
    // per++;
    return per;
  
  
  }
