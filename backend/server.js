const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import CORS middleware
const retry = require('retry');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
// Middleware
app.use(bodyParser.json());
// Function to establish MySQL connection with retry logic
function connectWithRetry() {
  const operation = retry.operation({
    retries: 5, // Number of retry attempts
    factor: 2, // Exponential backoff factor
    minTimeout: 1000, // Minimum time between retries (in milliseconds)
    maxTimeout: 60000, // Maximum time between retries (in milliseconds)
    randomize: true // Randomize the timeouts to avoid thundering herd problem
  });

  operation.attempt((currentAttempt) => {
    console.log(`Attempting to connect to MySQL (attempt ${currentAttempt})`);

    const db = mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_ROOT_PASSWORD,
      database: process.env.DB_NAME
    });

    db.connect((err) => {
      if (operation.retry(err)) {
        console.error(`Connection attempt ${currentAttempt} failed. Retrying...`);
        return;
      }

      if (err) {
        console.error('Unable to connect to MySQL:', err);
        return;
      }

      console.log('MySQL Connected');

      // Check if the database exists, if not, create it
      db.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`, (err) => {
        if (err) {
          console.error('Error creating database:', err);
          return;
        }
        console.log('Database created or already exists');

        // Use the specified database
        db.query(`USE ${process.env.DB_NAME}`, (err) => {
          if (err) {
            console.error('Error selecting database:', err);
            return;
          }

          // Check if the table exists, if not, create it
          const createTableQuery = `
            CREATE TABLE IF NOT EXISTS persons (
              id INT AUTO_INCREMENT PRIMARY KEY,
              name VARCHAR(255) NOT NULL,
              email VARCHAR(255) NOT NULL
            )
          `;
          db.query(createTableQuery, (err) => {
            if (err) {
              console.error('Error creating table:', err);
              return;
            }
            console.log('Table created or already exists');
          });
        });
      });
    });
  });
}

// Call the function to start the connection process
connectWithRetry();
// Health Check Route
app.get('/', (req, res) => {
  res.json({ message: 'API is working' });
});

// Get Person by ID
app.get('/api/person/:id', (req, res) => {
  const id = req.params.id;
  db.query('SELECT * FROM persons WHERE id = ?', id, (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(result);
    }
  });
});

// Get List of All Persons
app.get('/api/person', (req, res) => {
  db.query('SELECT * FROM persons', (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(results);
    }
  });
});

// Add Person
app.post('/api/person', (req, res) => {
  const { name, email } = req.body;
  db.query('INSERT INTO persons (name, email) VALUES (?, ?)', [name, email], (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: name+' added successfully', id: result.insertId });
    }
  });
});

// Update Person
app.put('/api/person/:id', (req, res) => {
  const id = req.params.id;
  const { name, email } = req.body;
  db.query('UPDATE persons SET name = ?, email = ? WHERE id = ?', [name, email, id], (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: name+' updated successfully' });
    }
  });
});

// Delete Person
app.delete('/api/person/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM persons WHERE id = ?', id, (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Person deleted successfully' });
    }
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
