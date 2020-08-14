/*  7/30/2020: countdown passed to clients in room 
    8/3/2020:  player can click one card on turn, pass to server, display to others so far.. had trouble passing in card ID bc it was checking too soon.. had to do after flipCard 
*/

// import modules
const express = require('express');
const http = require('http');
const socket = require('socket.io');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./Utils/users.js');
const { playerReady, playerUnready, getPlayers, findTurn, addCard, removeCard, getCards, checkMatch } = require('./Utils/players.js');
const { createCards, getSet, randomizeCards } = require('./Utils/cards.js');
const formatMessage = require('./Utils/messages.js');
const BOT = { name: 'MR CAT', src: 'animal.svg', color: '#3C3744' };

// create express app, set port
const app = express();
const port = 5500;

// create http server
const server = http.createServer(app);

// create io: reference to a socket connection made on the server
const io = socket(server);

// serve static html files
app.use(express.static('public'));

let totalPoints = 0;
let winner = "";
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

// HERE..   
            createCards(user.roomID);

            //console.log(getSet(user.roomID));
             // welcome user
             io.to(user.id).emit('message', formatMessage(BOT.name, BOT.src, BOT.color, 'Welcome to the chat!'));

            // send data to all the clients in the room
            io.to(user.roomID).emit('updateData', { 
                users: getUsersInRoom(user.roomID)
             });
            // console.log(getSet(user.roomID))
            // send randomized cards
            io.to(user.roomID).emit('randomizeCards', 
                 getSet(user.roomID) 
             );


        }
        // Check if roomID is stored and check if the room is full //
        else if ( (io.sockets.adapter.rooms[roomID]) && (io.sockets.adapter.rooms[roomID].length <= 3)) { // user is joining room
            const {user, error} = addUser({ id: socket.id, name, roomID: roomID, src });
            if (error) {
                return callback(error);
            }
            if (user) {
                // join room
                socket.join(user.roomID);

                // send randomized cards
                io.to(user.roomID).emit('randomizeCards', 
                getSet(user.roomID) 
                );  

                // send length of players in queue
                let players = getPlayers(user.roomID);
                io.to(user.id).emit('checkStarted', players.length);

                io.to(user.id).emit('message', formatMessage(BOT.name, BOT.src, BOT.color, 'Welcome to the chat!'));
                // msg to all but connected user
                socket.broadcast.to(user.roomID).emit('message', formatMessage(BOT.name, BOT.src, BOT.color,`${user.name} has joined`));
               
        
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


    // Listen for client to check player queue, return length
    socket.on('checkPlayers', () => {
        const user = getUser(socket.id);
        let players = getPlayers(user.roomID);
        socket.emit('playerNum', players.length);
    });

    
    // Listen for player to ready
    socket.on('playerReady', () => {
        const user = getUser(socket.id);
        let players = getPlayers(user.roomID);
        if (players.length < 1) {
            // Message to all in the room
            playerReady(user);
            //io.to(user.id).emit('message', formatMessage(BOT.name, BOT.src, BOT.color,`You have joined the queue. Waiting for 1 more player`));
            io.to(user.roomID).emit('playerReady', user);
        }
        else if (players.length === 1) {
                playerReady(user);
                //io.to(user.id).emit('message', formatMessage(BOT.name, BOT.src, BOT.color,`You have joined the queue.`));

                // Send countdown socket
                io.to(user.roomID).emit('countdown');
                io.to(user.roomID).emit('playerReady', user);

                // Randomize player turn
                let player = getPlayers(user.roomID);
                const num = Math.floor(Math.random() * Math.floor(2));
                player[num].turn = true;

                //console.log('Players : ' + JSON.stringify(player));

                // Change player turn value in Users array
                const playerData = getUser(player[num].id);
                playerData.turn = true;
                
                // Randomize cards
                const cards = getSet(user.roomID);
                randomizeCards(cards);
                // Send randomized cards
                io.to(user.roomID).emit('randomizeCards', 
                    getSet(user.roomID) 
                );  

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
    
    
    // Listen for player card click, pass to all clients
    socket.on('playerClick', (cardId, dataId) => {
        const user = getUser(socket.id);
        let players = getPlayers(user.roomID);
        const checkCards = getCards(user.roomID);
        console.log(checkCards.length)
        // check cards array, if 0 addCard, allow another click, pass to all.. if 1: add card and check if the cards match
        if (checkCards.length === 0) {
            addCard({ roomID: user.roomID, cardID: cardId, dataID: dataId });
            console.log('Players : ' + JSON.stringify(players));
            // Pass card data to the clients
            io.to(user.roomID).emit('cardFlip', cardId);

            // Pass to player another turn
            io.to(user.id).emit('playerTurn', user);
        }

        // One card in array: add card to array and check match
        if (checkCards.length === 1) {
            addCard({ roomID: user.roomID, cardID: cardId, dataID: dataId });
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
                    // Update player points and total pts
                    user.points += 100;
                    totalPoints += 100;

                    // Emit to clients to remove cards in DOM
                    io.to(user.roomID).emit('removeCards', cardList[0].cardID, cardList[1].cardID);

                    // send data to all the clients in the room
                    io.to(user.roomID).emit('updateData', { 
                        users: getUsersInRoom(user.roomID),
                    });

                    // Remove cards
                    removeCard(user.roomID);
                    removeCard(user.roomID);

                    // Check if points is less than 1000
                    console.log('total points: ' + totalPoints)
                    
                    // Check if points are equal to 1000 (game over)
                    if (totalPoints === 1000) {
                        // Check which user had more points
                        const playerPoints = getPlayers(user.roomID);
                        if (playerPoints[0].points > playerPoints[1].points) {
                            // Player 1 wins
                            console.log(`${playerPoints[0].name} Wins with ${playerPoints[0].points} points!!`)
                            winner = playerPoints[0].name;
                            // Update scores
                            playerPoints[0].win += 1;
                            playerPoints[1].loss += 1;
                        }
                        if (playerPoints[0].points < playerPoints[1].points) {
                            // Player 2 wins
                            console.log(`${playerPoints[1].name} Wins with ${playerPoints[1].points} points!!`)
                            winner = playerPoints[1].name;
                            // Update scores
                            playerPoints[1].win += 1;
                            playerPoints[0].loss += 1;
                        }
                        if (playerPoints[0].points === playerPoints[1].points) {
                            // Tie
                            console.log(`It is a tie !!`)
                            winner = "TIE";
                            // Update scores
                            playerPoints[0].tie += 1;
                            playerPoints[1].tie += 1;
                        }

                        // Reset turns
                        playerPoints[0].turn = false;
                        playerPoints[1].turn = false;
                        playerPoints[0].points = 0;
                        playerPoints[1].points = 0;
                        //playerUnready(playerPoints[0].id);
                        //io.to(user.roomID).emit('playerUnready', playerPoints[0].id);
                        //playerUnready(playerPoints[1].id);
                        //io.to(user.roomID).emit('playerUnready', playerPoints[1].id);
                        
                        // Reset total points
                        totalPoints = 0;

                       // io.to(playerPoints[0].id).emit('resetButton');
                        //io.to(playerPoints[1].id).emit('resetButton');
                        // Send updated data to client
                        io.to(user.roomID).emit('endData', { 
                            users: getUsersInRoom(user.roomID)
                        });

                        // Emit gameOver to client to reset game
                        io.to(user.roomID).emit('gameOver', winner);             
                    }

                    else {
                        // Allow player turn
                        io.to(user.id).emit('playerTurn', user);
                    }

                }

                if (!match) {
                    // Flip card back
                    //console.log(cardList[0].cardID)
                    io.to(user.roomID).emit('flipCards', cardList[0].cardID, cardList[1].cardID, user.name);
                    // Remove cards
                    removeCard(user.roomID);
                    removeCard(user.roomID);
                    
                    // Change player turn in players
                    const users = getUsersInRoom(user.roomID);
                    const players = getPlayers(user.roomID);      // --->
                    console.log(players)
                    let playerData;
                    
                    if (players[0].turn) {
                            players[0].turn = false;
                            players[1].turn = true;
                            playerData = players[1];
                    }

                    else {
                        players[0].turn = true;
                        players[1].turn = false;
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

    socket.on('playerUnready', () => {
        const user = getUser(socket.id);
        const player = playerUnready(user.id);
        //const players = getPlayers(user.roomID);
        if (player) {
            player.turn = false;
            io.to(user.roomID).emit('playerUnready', user);
            //io.to(user.id).emit('message', formatMessage(BOT.name, BOT.src, BOT.color,`You have been removed from the queue`));
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
            // send data to all the clients in the room
            io.to(user.roomID).emit('updateData', { 
                users: getUsersInRoom(user.roomID)
             });
        }
    });
});



server.listen(port, () => {
    console.log(`hello from ${port}!`);
})