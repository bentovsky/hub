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
Execute `git clone https://github.com/bentovsky/hub.git´
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

