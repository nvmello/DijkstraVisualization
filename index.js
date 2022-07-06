var PORT = process.env.PORT || 5000;
var express = require('express');
var app = express();

var http = require('http');
var server = http.Server(app);

app.use(express.static('dijkstra'));

server.listen(PORT, function() {
  console.log('Dijkstra Visualization Running');
});

const express = require('express')
const app = express()

app.use((req, res, next) => {
  console.log('Time:', Date.now())
  next()
})

app.use('/user/:id', (req, res, next) => {
    console.log('Request Type:', req.method)
    next()
  })

  app.get('/user/:id', (req, res, next) => {
    res.send('USER')
  })

  app.use('/user/:id', (req, res, next) => {
    console.log('Request URL:', req.originalUrl)
    next()
  }, (req, res, next) => {
    console.log('Request Type:', req.method)
    next()
  })

  app.get('/user/:id', (req, res, next) => {
    console.log('ID:', req.params.id)
    next()
  }, (req, res, next) => {
    res.send('User Info')
  })
  
  // handler for the /user/:id path, which prints the user ID
  app.get('/user/:id', (req, res, next) => {
    res.send(req.params.id)
  })