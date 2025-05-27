import mysql from 'mysql';
import dotenv from 'dotenv';

dotenv.config(); // Load env variables

const con = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

con.connect(function (err) {
  if (err) {
    console.log("Connection error:", err);
  } else {
    console.log("Connected to database");
  }
});

export default con;
