// import modules
const express = require('express');
const http = require('http');
const socket = require('socket.io');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./Utils/users.js');

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
    // listen for when user joins
    // callback function for return values
    // -- id, name, roomID, src, win, loss, tie, points, turn ---
    socket.on('join', ( { name, src, roomID}, callback ) => {
        // Check if ID is null
        if (roomID == null) { // user created lobby
            // add user to array of users, assign random game id
            const {user} = addUser({ id: socket.id, name, roomID: null, src });
            socket.join(user.roomID);
            console.log(`${user.name} has created a lobby. the room id is ${user.roomID}`); 
            // send data to all the clients //
            console.log(`Users in lobby: ${io.sockets.adapter.rooms[user.roomID].length}`)
        }
        // Check if roomID is stored and check if the room is full //
        else if ( (io.sockets.adapter.rooms[roomID]) && (io.sockets.adapter.rooms[roomID].length <= 4)) { // user is joining room
            const {user, error} = addUser({ id: socket.id, name, roomID: roomID, src });
            if (error) {
                return callback(error);
            }
            if (user) {
                socket.join(user.roomID);
                console.log(`${user.name} has join a lobby. the room id is ${user.roomID}`); 
                const users = getUsersInRoom(user.roomID);
        
            }
            //console.log(io.sockets.adapter.rooms[roomID].length)
            console.log(`Users in lobby: ${io.sockets.adapter.rooms[roomID].length}`)
        }
        else {
            callback(new Error('Invalid'))
        }


    });






    // user disconnect
    socket.on('disconnect', () => {
    console.log('user has disconnected');
    });
});



server.listen(port, () => {
    console.log(`hello from ${port}!`);
})