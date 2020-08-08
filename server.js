/*  7/30/2020: countdown passed to clients in room 
    8/3/2020:  player can click one card on turn, pass to server, display to others so far.. had trouble passing in card ID bc it was checking too soon.. had to do after flipCard 
*/

// import modules
const express = require('express');
const http = require('http');
const socket = require('socket.io');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./Utils/users.js');
const { playerReady, playerUnready, getPlayers, findTurn, addCard, removeCard, getCards, checkMatch } = require('./Utils/players.js');
const formatMessage = require('./Utils/messages.js');
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

    // Listen for player to ready
    socket.on('playerReady', () => {
        const user = getUser(socket.id);
        let players = getPlayers(user.roomID);
        if (players.length < 1) {
            // Message to all in the room
            playerReady(user);
            io.to(user.id).emit('message', formatMessage(BOT.name, BOT.src, BOT.color,`You have joined the queue. Waiting for 1 more player`));
            io.to(user.roomID).emit('playerReady', user);
        }
        else if (players.length === 1) {
                playerReady(user);
                io.to(user.id).emit('message', formatMessage(BOT.name, BOT.src, BOT.color,`You have joined the queue.`));
                // Send countdown socket
                io.to(user.roomID).emit('countdown');
                io.to(user.roomID).emit('message', formatMessage(BOT.name, BOT.src, BOT.color,`The game will begin soon`));
                io.to(user.roomID).emit('playerReady', user);
                // Randomize player turn
                let player = getPlayers(user.roomID);
                const num = Math.floor(Math.random() * Math.floor(2));
                player[num].turn = true;

                // Change player turn value in Users array
                const playerData = getUser(player[num].id);
                playerData.turn = true;
                
                //io.to(player[num].id).emit('message', formatMessage(BOT.name, BOT.src, BOT.color,`It is your turn`));

                // Send player whose turn it is to client
                io.to(player[num].id).emit('playerTurn', playerData);
                
                // Send player name to all clients to change DOM
                io.to(user.roomID).emit('playerName', playerData);

                // send data to all the clients in the room
                io.to(user.roomID).emit('updateData', { 
                    users: getUsersInRoom(user.roomID)
                });
        }
        else {
            io.to(user.id).emit('message', formatMessage(BOT.name, BOT.src, BOT.color,`The queue is full. Please wait`));
        }
        
    });
    
    //const cards = [];

    // Listen for player card click, pass to all clients
    socket.on('playerClick', cardId => {
        const user = getUser(socket.id);
        let players = getPlayers(user.roomID);
        const checkCards = getCards(user.roomID);
        // store player data
        

        // check cards array, if 0 addCard, allow another click, pass to all.. if 1: add card and check if the cards match
        if (checkCards.length === 0) {
            addCard({ roomID: user.roomID, cardID: cardId });
            
            // Pass card data to the clients
            io.to(user.roomID).emit('cardFlip', cardId);

            // Pass to player another turn
            io.to(user.id).emit('playerTurn', user);
        }

        // One card in array: add card to array and check match
        if (checkCards.length === 1) {
            addCard({ roomID: user.roomID, cardID: cardId });
            const cardList = getCards(user.roomID);
            //console.log(`Card Length: ${cardList.length}`)
            // Pass card data to the clients
            io.to(user.roomID).emit('cardFlip', cardId);

            // Check Card Match
            if (cardList.length === 2) {
                
                // Check if the cards match
                const match = checkMatch(cardList);
                
                // Cards match: remove the two cards, send to clients, update points, allow another turn
                if (match) {
                    // Update player points
                    user.points += 100;
                    // Emit to clients to remove cards in DOM
                    io.to(user.roomID).emit('removeCards', cardList[0].cardID, cardList[1].cardID);
                    io.to(user.roomID).emit('updateData', { 
                        users: getUsersInRoom(user.roomID)
                    });
                    // Remove cards
                    removeCard(user.roomID);
                    removeCard(user.roomID);

                    // Allow player turn
                    io.to(user.id).emit('playerTurn', user);
                }

                /* 8/6/2020 @@@@@@@@@@!!! ONLY ONE CARD FLIPS BACK!!! FINISH THIS PART!!! ---FIXED?*/ 
                // Card dont match: flip the two cards back to clients, randomize cards?, change player turn to false and other to true, pass playerTurn/playerName
                // 8/7/2020:: Fix highlights? Player Turn switch, Make sure cards are removing?
                // Same card press glitches up...
                if (!match) {
                    // Flip card back
                    io.to(user.roomID).emit('flipCards', cardList[0].cardID, cardList[1].cardID, user.name);
                    // Remove cards
                    removeCard(user.roomID);
                    removeCard(user.roomID);
                    
                    // Change player turn in players
                    const users = getUsersInRoom(user.roomID);
                    players = getPlayers(user.roomID);
                    let playerData;
                    if (players[0].turn) {
                            console.log('true player0')
                            players[0].turn = !players[0].turn;
                            players[1].turn = !players[1].turn;
                            playerData = players[1];
                    }

                    else {
                        console.log('true player1')
                        players[0].turn = !players[0].turn;
                        players[1].turn = !players[1].turn;
                        playerData = players[0];
                    }

                    // Change turn in users array
                    for (let i = 0; i < users.length; i++) {
                        if (users[i].name === players[0].name) {
                            users[i].turn = players[0].turn;
                        }
                        if (users[i].name === players[1].name) {
                            users[i].turn = players[1].turn;
                        }
                    }
                   
                    // Send playerData
                    io.to(user.roomID).emit('updateData', { 
                        users: getUsersInRoom(user.roomID)
                     });
                   

                   
                    // Send turn to player
                    io.to(playerData.id).emit('playerTurn', playerData);
                    


                    // Send player name to all clients to change DOM
                     io.to(user.roomID).emit('playerName', playerData);                    
                }
            }


        }
    

    });

    // Listen for playerTurn to begin game.. client sends user with turn:true, 
    /*
    socket.on('playerTurn', () => {
        // get user details
        const user = getUser(socket.id);

        io.to(user.id).emit('message', formatMessage(BOT.name, BOT.src, BOT.color,`It is your turn`));

        // emit to client who will call function for user to play turn
        socket.emit('playerTurn', )
    }); 
    */
    socket.on('playerUnready', () => {
        const user = getUser(socket.id);
        const player = playerUnready(user.id);
        //const players = getPlayers(user.roomID);
        if (player) {
            player.turn = false;
            io.to(user.roomID).emit('playerUnready', user);
            io.to(user.id).emit('message', formatMessage(BOT.name, BOT.src, BOT.color,`You have been removed from the queue`));
        }  
        
    });

    






    // user disconnect
    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if (user) {
            const player = playerUnready(user.id);
            if (player) {
                io.to(user.roomID).emit('playerUnready', user);
            }  
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