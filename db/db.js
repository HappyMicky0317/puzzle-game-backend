const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "localhost", // Replace with your database host
  port: "3306", // Replace with your database host
  user: "root", // Replace with your database username
  password: "", // Replace with your database password
  database: "puzzle_game", // Replace with your database name
  wait_timeout : 0
});

connection.connect((error) => {
  if (error) {
    console.error("Error connecting to the database: ", error);
  } else {
    console.log("Connected to the database!");
  }
});

module.exports = connection;
