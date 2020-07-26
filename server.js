// import modules
const express = require('express');
const http = require('http');
const socket = require('socket.io');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./Utils/users.js');
const formatMessage = require('./Utils/messages.js');
const { format } = require('path');
const BOT = { name: 'CAT BOT', src: 'animal.svg', color: 'orange' };

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
             // welcome user
             io.to(user.id).emit('message', formatMessage(BOT.name, BOT.src, BOT.color, 'Welcome to the chat!'));

            // send data to all the clients in the room
            io.to(user.roomID).emit('updateData', { 
                users: getUsersInRoom(user.roomID)
             });

        }
        // Check if roomID is stored and check if the room is full //
        else if ( (io.sockets.adapter.rooms[roomID]) && (io.sockets.adapter.rooms[roomID].length <= 3)) { // user is joining room
            const {user, error} = addUser({ id: socket.id, name, roomID: roomID, src });
            if (error) {
                return callback(error);
            }
            if (user) {
                socket.join(user.roomID);
                io.to(user.id).emit('message', formatMessage(BOT.name, BOT.src, BOT.color, 'Welcome to the chat!'));
                // msg to all but connected user
                socket.broadcast.to(user.roomID).emit('message', formatMessage(BOT.name, BOT.src, BOT.color,`${user.name} has joined`));
                //const users = getUsersInRoom(user.roomID);
        
            }
            //console.log(io.sockets.adapter.rooms[roomID].length)
            //console.log(`Users in lobby: ${io.sockets.adapter.rooms[roomID].length}`)
            // send data to all the clients in the room
            io.to(user.roomID).emit('updateData', { 
                users: getUsersInRoom(user.roomID)
             });
        }
        else {
            callback(new Error('Invalid'))
        }
    });

    // Listen for chat message from client
    socket.on('chatMessage', (msg) => {
        // get the user data of who sent the message
        const user = getUser(socket.id);
        //console.log(user);
        if (user) {
            // format the message, send to all clients in room
            io.to(user.roomID).emit('message', formatMessage(user.name, user.src, user.color, msg));
        }
    });






    // user disconnect
    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if (user) {
            // msg to clients user left
            io.to(user.roomID).emit('message', formatMessage(BOT.name, BOT.src, BOT.color,`${user.name} has left`));
            // update user list
            io.to(user.roomID).emit('updateData', { 
                users: getUsersInRoom(user.roomID)
             });
        }
    });
});



server.listen(port, () => {
    console.log(`hello from ${port}!`);
})