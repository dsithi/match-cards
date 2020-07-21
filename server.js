// import modules
const express = require('express');
const http = require('http');
const socket = require('socket.io');
// create express app, set port
const app = express();
const port = 5500;
// create http server
const server = http.createServer(app);
// create io: reference to a socket connection made on the server
const io = socket(server);
// serve static html files
app.use(express.static('public'));

// Run when client connects
io.on('connection', socket => {
    console.log('new user joined');






    // user disconnect
    socket.on('disconnect', () => {
    console.log('user has disconnected');
});
});



server.listen(port, () => {
    console.log(`hello from ${port}!`);
})