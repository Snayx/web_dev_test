const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const mariadb = require('mariadb');
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/assets'));
app.use(express.static(__dirname + '/assets/css'));
app.use(express.static(__dirname + '/assets/img'));
app.use(express.static(__dirname + '/assets/js'));
app.use(express.static('assets', { 
  mimeTypes: { 
    js: 'js',
    css: 'text/css'
  } 
}));

app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

app.get('/', function(request, response) {
  if (request.session.loggedin) {
    response.sendFile(__dirname + '/main.html');
  } else {
      response.sendFile(__dirname + '/main.html');
    //else
  }
});
app.get('/logout', function(request, response) {
  // Destroy the session
  request.session.destroy(function(err) {
    if (err) {
      console.log(err);
    } else {
      response.redirect('/');
    }
  });
});
const pool = mariadb.createPool({
  host: '92.221.22.206:3306',
  user: 'Demo',
  password: 'EI3SE732ER',
  database: 'Demo'
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).send('Email and password are required');
  }

  try {
    // Get a database connection from the pool
    const conn = await pool.getConnection();

    // Query the database to check if the user's email and password match
    const result = await conn.query('SELECT * FROM users WHERE username = ? AND password = ?', [email, password]);
    
    conn.release();
    if (result.length > 0) {
      req.session.loggedin = true;
      req.session.email = email;
      res.redirect('/');
    } else {
      req.session.loggedin = false;
      res.status(401).send('Invalid email or password');
    }
  } catch (err) {
    res.status(500).send('Internal server error');
  }
});

app.get('/status', (req, res) => {
if (req.session.loggedin) {
  res.json({ loggedIn: true });
} else {
  res.json({ loggedIn: false });
}
});

app.get('/download', function(req, res){
  const file = __dirname + '/assets/dwn/test.txt';
  res.download(file);
});


app.post('/insert-text', async (req, res) => {
  const text = req.body.text;

  try {
    const conn = await pool.getConnection();
    const rows = await conn.query("INSERT INTO messages (text) VALUES (?)", [text]);
    conn.release();
    res.statusCode = 200;
    res.json({ message: 'Text inserted successfully' });
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    res.json({ message: 'Error inserting text' });
  }
});



app.listen(3000, function() {
  console.log('Server listening on port 3000!');
});