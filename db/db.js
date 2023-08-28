const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "localhost", // Replace with your database host
  port: "3306", // Replace with your database host
  user: "root", // Replace with your database username
  password: "", // Replace with your database password
  database: "puzzle_game", // Replace with your database name
    keepAlive: true,
});

connection.connect((error) => {
  if (error) {
    console.error("Error connecting to the database: ", error);
  } else {
    console.log("Connected to the database!");
    
    setInterval(() => {
      connection.query("SELECT * FROM category", (error, result) => {
        if (error) {
          console.error("Error executing query: ", error);
        } else {
          console.log("Query results:");
        }
      });
    }, 3000000);
  }
});
module.exports = connection;
