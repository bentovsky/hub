# hub

 #### 1. Prerequisite
 ##### 1.1In order to run this repo it is necessary to have mosquitto and mysql installed
 #### 2. Instalation
 ##### 2.1. Clone the code repository:
 `git clone https://github.com/bentovsky/hub.git
 ##### 2.2. Install modules
Inside the project's directory execute ´npm install´
###### 2.3. Import database.sql file
Run MySQL and create a database by executing ´CREATE DATABASE <databasename>´
Inside the project's directory execute ´mysql -u <username> -p <databasename> < database.sql´
##### 3. Usage
###### 3.1. Stablish MQTT and MySQL connection
Open app.js and modify the username and password in the MQTT and MySQL setup functions.
###### 3.2. Inside the project's directory run ´node app.js´
