var mysql = require('mysql');
var mysqlDump = require('mysqldump');
var mysqlImport = require('node-mysql-importer');

/**
 * 
 * @desc Setup for mysql connection
 * @param {sting} user Database user
 * @param {string} pwd user's password
 * @param {string} host mysql connection's host
 * @param {string} database database name
 */
var pool = exports.setup = function(user,pwd,host,database){
        pool = mysql.createPool({
        host     : host,
        user     : user,
        password : pwd,
        database : database,
        debug : false,
        connectionLimit : 100
    });

    pool.getConnection(function(err,connection){
        if (err){
            console.log('\n CONNECTION TO DATABASE FAILED - WRONG SETUP \n',err);
            process.exit();
        }
    })
}


/**
 * 
 * @desc Add received vaules to database
 * @param {object} receivedJSON received JSON
 * @param {array} matrix received matrix
 * @callback callback 
 */


exports.addToDB = function(receivedJSON,matrix,callback){
    pool.getConnection(function(err, connection){  
        connection.query("SELECT * FROM listing WHERE nodeID="+receivedJSON.nodeID, function(err, rows){
            if (rows.length==0){
                var addSensor = "INSERT INTO listing (nodeID,state) "+
                "SELECT * FROM (SELECT "+receivedJSON.nodeID+",1) AS tmp "+
                "WHERE NOT EXISTS (SELECT nodeID FROM listing WHERE nodeID="+receivedJSON.nodeID+");";

                connection.query(addSensor, function(err, rows){
                    if(err) throw err;
                    else {
                        console.log('listing - SENSOR INSERTED');
                        addreceivedValue(receivedJSON,matrix,callback);
                        connection.release();      
                    }
                });
            }
            else {

                var updateSensor = "UPDATE listing SET type='', state=0 " +
                "WHERE nodeID=" + receivedJSON.nodeID +";";

                connection.query(updateSensor, function(err, rows){
                    if(err) throw err;
                    else {
                        console.log('listing - SENSOR UPDATED');
                        addreceivedValue(receivedJSON,matrix,callback);
                        connection.release();
                    }
                });
            }
        });  
      });
}


function addreceivedValue(receivedJSON,callback){
    pool.getConnection(function(err, connection){
        var addValue = "INSERT INTO receivedValue (matrix,sizeX,sizeY,orientation,sensorID) SELECT '"+
        receivedJSON.matrix+"', "+receivedJSON.sizeX+", "+receivedJSON.sizeY+
        ", 'left/right', l.ListingID FROM listing l WHERE l.nodeID="+receivedJSON.nodeID+";"

        connection.query(addValue, function(err, rows){
            if(err)
                throw err;
            else{
                console.log('receivedValue - VALUE INSERTED');
                inserted = 1;
                callback(inserted);
                connection.release();
            }
            //addreceivedAction(receivedJSON,callback);
            //console.log('ReceivedAction - ACTION UPDATED');
        });
    });
}

// function addreceivedConfig(receivedJSON,callback){
//     pool.getConnection(function(err, connection){
        
//         var searchConfig = "SELECT * FROM ReceivedConfig "+
//         "WHERE sensorID = (SELECT listingID FROM listing WHERE nodeID="+receivedJSON[0].nodeID+");"
//         connection.query(searchConfig, function(err, rows){
//             if (err)
//                 throw err;
//             else{
//                 if(rows.length==0){
//                     var addConfig = "INSERT INTO ReceivedConfig(type,value,sensorID) "+
//                     "SELECT '"+receivedJSON[0].config[0].name+"',"+receivedJSON[0].config[0].values+","+
//                     "l.listingID from Listing l WHERE l.nodeID="+receivedJSON[0].nodeID+";";
//                     connection.query(addConfig, function(err, rows){
//                         console.log('ReceivedConfig - CONFIG INSERTED');
//                         addreceivedAction(receivedJSON,callback);
//                         connection.release();  
//                     });
//                 }
//                 else{

//                     var updateConfig = "UPDATE receivedConfig SET type='" + receivedJSON[0].config[0].name +
//                     "', value="+receivedJSON[0].config[0].values+
//                     " WHERE sensorID=" + rows[0].sensorID +";";    

//                     connection.query(updateConfig, function(err, rows){
//                         console.log('receivedConfig - CONFIG UPDATED');
//                         addreceivedAction(receivedJSON,callback);
//                         connection.release();  
//                     });
//                 }
//             }
//         })
//     });
// }



// function addreceivedAction(receivedJSON,callback){
//     pool.getConnection(function(err, connection){

//         var searchAction = "SELECT * FROM ReceivedAction "+
//         "WHERE sensorID = (SELECT listingID FROM Listing WHERE nodeID="+receivedJSON[0].nodeID+");"

//         connection.query(searchAction, function(err, rows){
//             if (err)
//                 throw err;
//             else{
//                 if(rows.length==0){
//                     var addAction = "INSERT INTO ReceivedAction(type,value,sensorID) "+
//                     "SELECT '"+receivedJSON[0].action[0].name+"', '"+receivedJSON[0].action[0].values+"',"+
//                     "l.listingID from Listing l WHERE l.nodeID="+receivedJSON[0].node+";";    
//                     connection.query(addAction, function(err, rows){
//                         console.log('ReceivedAction - ACTION INSERTED');
//                         inserted = 1;
//                         callback(inserted);
//                         connection.release();  
//                     });
//                 }
//                 else{
                   
//                     var updateAction = "UPDATE ReceivedAction SET type='" + receivedJSON[0].action[0].name +
//                     "', value='"+receivedJSON[0].action[0].values+
//                     "' WHERE sensorID=" + rows[0].sensorID +";";    
//                     connection.query(updateAction, function(err, rows){
//                         console.log('ReceivedAction - ACTION UPDATED');
//                         inserted = 1;
//                         callback(inserted);
//                         connection.release();  
//                     });
//                 }  
//             }
//         })
//     });
// }




/**
 * 
 * @desc Drop the entire database
 * @callback callback 

 */
exports.dropDB = function(callback){
    pool.getConnection(function(err, connection){
        var ver = 0;
        var clearTables =["DELETE FROM receivedValue","DELETE FROM receivedConfig",
        "DELETE FROM receivedAction",
        "DELETE FROM nodeErrors",
        "DELETE FROM listing",
        "ALTER TABLE listing AUTO_INCREMENT=1;",
        "ALTER TABLE receivedValue AUTO_INCREMENT=1;",
        "ALTER TABLE nodeErrors AUTO_INCREMENT=1;",
        "ALTER TABLE receivedConfig AUTO_INCREMENT=1;",
        "ALTER TABLE receivedAction AUTO_INCREMENT=1;"]


        for (let i = 0; i < clearTables.length; i++) {
            connection.query(clearTables[i], function(err, rows){
                if (err)
                    throw err;
            });
        }
        console.log('TABLES CLEARED');
        ver=1;
        callback(ver);
        connection.release();
    });
}



/**
 * 
 * @desc Drop a specific table
 * @param {string} table table to drop 
 */
exports.dropTable = function(table){

    pool.getConnection(function(err, connection){

        var clearTable =["DELETE FROM "+table,
        "ALTER TABLE "+table+" AUTO_INCREMENT=1;"]

        for (let i = 0; i < clearTable.length; i++) {
            connection.query(clearTable[i], function(err, rows){
                if (err)
                    throw err;
            });
        }
        console.log('TABLE '+table +' CLEARED');
    });
}

/**
 * 
 * @desc export a specific database
 * @param {object} pool object with the connection information
 * @param {string} file file in which the database will be exported
 * @callback callback
 */
exports.exportDB = function(file,callback){

    var exported;
    mysqlDump({
        host: pool.config.connectionConfig.host,
        user: pool.config.connectionConfig.user,
        password: pool.config.connectionConfig.password,
        database: pool.config.connectionConfig.database,
        dest:file // destination file
    },function(err){
        // create data.sql file;
    })
    exported=1;
    callback(exported);
}

/**
 * 
 * @desc Import database from .sql file
 * @param {object} pool - object with the connection information 
 * @param {string} file - file
 */
exports.importDB = function(file){

    mysqlImport.config({
        'host': pool.config.connectionConfig.host,
        'user': pool.config.connectionConfig.user,
        'password': pool.config.connectionConfig.password,
        'database': pool.config.connectionConfig.database,
    })

    mysqlImport.importSQL(file).then( () => {
        console.log(file +' IMPORTED');
    }).catch( err => {
        console.log(`error: ${err}`)
    })
}


/**
 * 
 * @desc Get all database tables
 * @param {object} pool - object with the connection information
 * @callback callback 
 */
exports.getTables = function(callback){
    pool.getConnection(function(err, connection){
        connection.query('SHOW TABLES', function(err, rows){
            connection.release();
            callback(rows);
        });
    });
}

var fct1=function(callback){
    var arrayCount = [];
    pool.getConnection(function(err, connection){
        connection.query('SHOW TABLES', function(err, tables){
            var pending = tables.length;
            for (var i = 0; i < tables.length; i++) {
                connection.query("SELECT COUNT(*) AS "+tables[i].Tables_in_sensors+" FROM "+tables[i].Tables_in_sensors, function(err, count){
                    arrayCount.push(count);
                    
                    if(0===--pending){
                        ver = 1;
                        connection.release();
                        callback(ver,arrayCount)
                    }
                })
            }
        })
    })
}
/**
 * 
 * @desc Count the rows in each table
 * @callback callback 
 */
exports.getCount = fct1.bind(this)

/**
 * 
 * @desc Convert the entire database into a JSON object in the format: {table,value}
 * @callback callback 
 * 
 */
exports.convertDBToJSON = function(callback){
    pool.getConnection(function(err, connection){
        var ver=0;
        var count=0;
        var sendTables = [];
        var sendJSON = [];
        var sendValue = [];
        var key;
        connection.query('SHOW TABLES', function(err, tables){
            var pending = tables.length;
            for (var i = 0; i < tables.length; i++) {
                connection.query('SELECT * FROM '+tables[i].Tables_in_sensors, function(err, rows){
                    
                    sendTables.push(tables[count].Tables_in_sensors)
                    sendValue.push(rows);
                    sendJSON[count] = {"table":sendTables[count],"value":sendValue[count]};

                    count = count +1;
                    if( 0 === --pending) {
                        ver=1;
                        connection.release();
                        callback(ver,sendJSON); //callback if all queries are processed
                    }s
                });
            }
        });   
    });
}

/**
 * 
 * @desc Convert the received table into a JSON object in the format: {table,value}
 * @param {string} table 
 * @callback callback 
 */
exports.convertTableToJSON = function(table,callback){
    var sendJSON=[]
    pool.getConnection(function(err, connection){
        connection.query('SELECT * FROM '+table, function(err, rows){
            
            sendJSON = {"table":table,"value":rows};
            connection.release();
            callback(sendJSON); //callback if all queries are processed
            
        });
    });
}

/**
 * 
 * @desc Check if the listing table is empty
 * @callback callback 
 */
exports.isEmpty = function(callback){
    var indexTables=[];
    var emptyStr=[];
    var isEmpty = 0;
    pool.getConnection(function(err, connection){
        connection.query('SELECT * FROM listing', function(err, rows){
            if(rows.length==0){
                isEmpty = 1;
            }
            else{
                isEmpty = 0;
            }
            connection.release();
            callback(isEmpty)
        });
    })
}
