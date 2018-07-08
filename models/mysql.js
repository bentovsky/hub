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
        database : database
    });

    pool.getConnection(function(err,connection){
        if (err){
            console.log('\n CONNECTION TO DATABASE FAILED - WRONG SETUP \n');
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
        connection.query("SELECT * FROM Listing WHERE nodeID="+receivedJSON[0].node, function(err, rows){
            if (rows.length==0){
                var addSensor = "INSERT INTO Listing (nodeID,type,state) "+
                "SELECT * FROM (SELECT "+receivedJSON[0].node+",'"+receivedJSON[0].sensor[0].name+"',1) AS tmp "+
                "WHERE NOT EXISTS (SELECT nodeID FROM Listing WHERE nodeID="+receivedJSON[0].node+");";

                connection.query(addSensor, function(err, rows){
                    if(err) throw err;
                    else {
                        console.log('Listing - SENSOR INSERTED');
                        addReceivedValue(receivedJSON,matrix,callback);
                        connection.release();      
                    }
                });
            }
            else {

                var updateSensor = "UPDATE Listing SET type='" + receivedJSON[0].sensor[0].name + "', state=0 " +
                "WHERE nodeID=" + receivedJSON[0].node +";";        

                connection.query(updateSensor, function(err, rows){
                    if(err) throw err;
                    else {
                        console.log('Listing - SENSOR UPDATED');
                        addReceivedValue(receivedJSON,matrix,callback);
                        connection.release();         
                    }
                });
            }
        });  
      });
}


function addReceivedValue(receivedJSON,matrix,callback){
    pool.getConnection(function(err, connection){
        var addValue = "INSERT INTO ReceivedValue (matrix,sizeX,sizeY,orientation,SensorID) SELECT '"+
        matrix+"', "+matrix.length+", "+matrix[0].length+
        ", 'left/right', l.ListingID FROM Listing l WHERE l.nodeID="+receivedJSON[0].node+";"

        connection.query(addValue, function(err, rows){
            if(err)
                throw err;
            else{
                console.log('ReceivedValue - VALUE INSERTED');
                connection.release();
            }
            addReceivedConfig(receivedJSON,callback);
        });
    });
}

function addReceivedConfig(receivedJSON,callback){
    pool.getConnection(function(err, connection){
        
        var searchConfig = "SELECT * FROM ReceivedConfig "+
        "WHERE SensorID = (SELECT ListingID FROM Listing WHERE nodeID="+receivedJSON[0].node+");"
        connection.query(searchConfig, function(err, rows){
            if (err)
                throw err;
            else{
                if(rows.length==0){
                    var addConfig = "INSERT INTO ReceivedConfig(type,value,SensorID) "+
                    "SELECT '"+receivedJSON[0].config[0].name+"',"+receivedJSON[0].config[0].values+","+
                    "l.ListingID from Listing l WHERE l.nodeID="+receivedJSON[0].node+";";  
                    connection.query(addConfig, function(err, rows){
                        console.log('ReceivedConfig - CONFIG INSERTED');
                        addReceivedAction(receivedJSON,callback);
                        connection.release();  
                    });
                }
                else{

                    var updateConfig = "UPDATE ReceivedConfig SET type='" + receivedJSON[0].config[0].name +
                    "', value="+receivedJSON[0].config[0].values+
                    " WHERE SensorID=" + rows[0].SensorID +";";    

                    connection.query(updateConfig, function(err, rows){
                        console.log('ReceivedConfig - CONFIG UPDATED');
                        addReceivedAction(receivedJSON,callback);
                        connection.release();  
                    });
                }
            }
        })
    });
}



function addReceivedAction(receivedJSON,callback){
    pool.getConnection(function(err, connection){

        var searchAction = "SELECT * FROM ReceivedAction "+
        "WHERE SensorID = (SELECT ListingID FROM Listing WHERE nodeID="+receivedJSON[0].node+");"

        connection.query(searchAction, function(err, rows){
            if (err)
                throw err;
            else{
                if(rows.length==0){
                    var addAction = "INSERT INTO ReceivedAction(type,value,SensorID) "+
                    "SELECT '"+receivedJSON[0].action[0].name+"', '"+receivedJSON[0].action[0].values+"',"+
                    "l.ListingID from Listing l WHERE l.nodeID="+receivedJSON[0].node+";";    
                    connection.query(addAction, function(err, rows){
                        console.log('ReceivedAction - ACTION INSERTED');
                        inserted = 1;
                        callback(inserted);
                        connection.release();  
                    });
                }
                else{
                   
                    var updateAction = "UPDATE ReceivedAction SET type='" + receivedJSON[0].action[0].name +
                    "', value='"+receivedJSON[0].action[0].values+
                    "' WHERE SensorID=" + rows[0].SensorID +";";    
                    connection.query(updateAction, function(err, rows){
                        console.log('ReceivedAction - ACTION UPDATED');
                        inserted = 1;
                        callback(inserted);
                        connection.release();  
                    });
                }  
            }
        })
    });
}




/**
 * 
 * @desc Drop the entire database
 * @callback callback 

 */
exports.dropDB = function(callback){
    pool.getConnection(function(err, connection){
        var ver = 0;
        var clearTables =["DELETE FROM ReceivedValue","DELETE FROM ReceivedConfig",
        "DELETE FROM ReceivedAction",
        "DELETE FROM NodeErrors",
        "DELETE FROM Listing",
        "ALTER TABLE Listing AUTO_INCREMENT=1;",
        "ALTER TABLE ReceivedValue AUTO_INCREMENT=1;",
        "ALTER TABLE NodeErrors AUTO_INCREMENT=1;",
        "ALTER TABLE ReceivedConfig AUTO_INCREMENT=1;",
        "ALTER TABLE ReceivedAction AUTO_INCREMENT=1;"]


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
/**
 * 
 * @desc Count the rows in each table
 * @callback callback 
 */
exports.getCount = function(callback){
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
                    }
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
 * @desc Check if the Listing table is empty
 * @callback callback 
 */
exports.isEmpty = function(callback){
    var indexTables=[];
    var emptyStr=[];
    var isEmpty = 0;
    pool.getConnection(function(err, connection){
        connection.query('SELECT * FROM Listing', function(err, rows){
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
