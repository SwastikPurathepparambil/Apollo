const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const port = process.env.PORT || 5000;

// TiDB database connection
const connection = mysql.createConnection({
  host: 'gateway01.us-east-1.prod.aws.tidbcloud.com',
  user: '2Bxpch2ZEvSrpNQ.root',
  password: '9CCuVEj51HP5gZOi',
  database: 'Cluster0',
});

// Connect to TiDB
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to TiDB:', err);
  } else {
    console.log('Connected to TiDB!');
  }
});

app.use(cors());

// Add your API routes here

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
