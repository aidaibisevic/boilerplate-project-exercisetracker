const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
var bodyParser = require('body-parser');

// support parsing of application/json type post data
app.use(bodyParser.json());

//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());
app.use(express.static('public'));

const users = [];
const userE = [];

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.post('/api/users', (req, res) => {
  username = req.body.username;
  user = {
    username,
    _id: uuidv4(),
  };
  users.push(user);
  console.log(users);
  res.json(user);
});

app.post('/api/users/:_id/exercises', (req, res) => {
  const { id, description, duration } = req.body;
  const date = new Date(req.body.date);
  const userId = users.find((user) => user._id === id);
  console.log(userId);
  if (userId) {
    const exercise = {
      username: userId.username,
      description,
      duration,
      date: date.toDateString(),
      _id: userId._id,
    };
    userE.push(exercise);
    res.json(exercise);
  }
});

function formatDate(date) {
  var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}

app.get('/api/users/:_id/logs', (req, res) => {
  const id = req.params._id;
  const { from, to, limit } = req.query;
  const userId = userE.filter((user) => user._id === id);
  const log_users = userId.map((user) => {
    return {
      description: user.description,
      duration: user.duration,
      date: user.date,
    };
  });

  console.log(log_users);

  let log;
  log = {
    username: userId[0].username,
    count: userId.length,
    _id: userId[0]._id,
  };
  if (userId) {
    log.log = log_users;
  }

  if (from) {
    console.log('Entering from');
    const newLogUser = log.log.filter((user) => {
      console.log(from);
      console.log(formatDate(user.date));
      return formatDate(user.date) >= from;
    });
    log.log = newLogUser;
  }

  if (to) {
    console.log(log.log);
    console.log('To is executed');
    const newLogUserTo = log.log.filter((user) => {
      return formatDate(user.date) < to;
    });
    log.log = newLogUserTo;
    console.log(newLogUserTo);
  }

  if (limit) {
    const limitLogUser = log.log.slice(0, limit);
    log.log = limitLogUser;
  }

  console.log(log);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
