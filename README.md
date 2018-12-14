# hub

The goal of this project is to create an IoT data collection framework, allowing interoperability between devices.
In this project the following material will be used:
- Raspberry Pi (as the hub);
- Wi-Fi modules (ESP8266).

One of the ESP8266 will be connected to the hub through serial port (root) and the rest (nodes) will comunicate via Wi-Fi.
With this hub will be possible to collect the data from several sensors and send it through MQTT in order to be stored afterwards.

This project is divided in 2 different modules:
- `app.js` - is responsible to collect the data from the sensors and send that information via MQTT to a second module.
- `objDetct.js` - receives the values from the `app.js` and 

 **1. Prerequisite** 
In order to run this repo it is necessary to have mosquitto and mysql installed

 **2. Instalation**
 - 2.1. Clone the code repository:
Execute `git clone https://github.com/bentovsky/hub.git`
 - 2.2. Install modules:
Inside the project's directory execute `npm install`
 - 2.3. Import database.sql file:
 Run MySQL and create a database by executing `CREATE DATABASE <databasename>`
Inside the project's directory execute `mysql -u <username> -p <databasename> < database.sql`

**3. Usage**
 - 3.2. Stablish MQTT and MySQL connection
    Open app.js and modify the username and password in the MQTT and MySQL setup functions.
 - 3.3. Run the project:
    Inside the project's directory run `node app.js`
 - 3.4. The app will receive the data from each node according to the following format:

**4. Funtionalities**
 The `app.js` has the following functionalities:
  - Receives data from serial and trasnforms it in an array with the ID of the sending node, matrix's total lines, column that is being read and the values itselft.
  - Builds a matrix based on the values received column by column.
  - Creates an array of JSON objects (final_json) for each new ID that receives. The final_json variable as the following fields: 
   * nodeID: ID of the sending node
   - sizeY: number of matrix's lines
   - sizeX: number of matrix's columns
   - counter: counter of receiving columns
   - initial_value: first column received by the hub
   - matrix:  matrix with all the received values
 - When all the data is received, the application will store it a database.
 - Finally the database is sent over MQTT each 20 seconds (default interval). This interval can be changed modifying the timer_emit variable.
 
 The `objDetct.js` has the following functionalities:
 
 
