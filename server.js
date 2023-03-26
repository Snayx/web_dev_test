const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'database_name'
});

connection.connect(function(err) {
  if (err) throw err;
  console.log('Database connected!');
});

app.get('/', function(request, response) {
  response.sendFile(__dirname + '/login.html');
});

app.post('/auth', function(request, response) {
  const username = request.body.username;
  const password = request.body.password;
  if (username && password) {
    connection.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
      if (results.length > 0) {
        request.session.loggedin = true;
        request.session.username = username;
        response.redirect('/home');
      } else {
        response.send('Incorrect username and/or password!');
      }           
      response.end();
    });
  } else {
    response.send('Please enter username and password!');
    response.end();
  }
});

app.get('/home', function(request, response) {
  if (request.session.loggedin) {
    response.send('Welcome back, ' + request.session.username + '!');
  } else {
    response.send('Please login to view this page!');
  }
  response.end();
});

app.listen(3000, function() {
  console.log('Server listening on port 3000!');
});