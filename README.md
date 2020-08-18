# match-cards
https://match--cards.herokuapp.com/
## Description
- Turn based multiplayer card game with chatroom created with Javascript/CSS/HTML/node.js/express and hosted on heroku
- Players can create or join a game. Creating a game generates a game code to give to players joining.
- A name and avatar are selected to play
- Four players are allowed in a game room, but only two can play the game at a time.
- Once two players press ready, the game begins
- On player turn, two cards a picked to find a match. A match continues the turn and no match will pass the turn.
- After all the cards are gone, the one with higher points is the winner.

## Socket.io
- This application utilizes socket.io for many of its functionalities. Many of the actions involve the client sending something to the server, the server receiving that something,
and sending an event to the clients, where it then can call functions or change the DOM. It also uses express/node for the web server.

### Chat
- The chatroom allows users to input a message and whenever send is pressed, the message is sent to the server. The server receives the message and sends that message to all the clients.
All the clients receive the message and the client then changes the DOM of the HTML, adding the message.

### Game
- When a lobby is created, the server creates a new array that contains an array of the card images. That array of cards is randomized when the game starts.
- The server keeps track of the number of people who have pressed ready. When two players have pressed the button, the server sends a start game event to the clients
as well as the randomized cards and current player turn to the clients. They all receive that event and start a countdown function and the game begins.
- On player turn, one card can be clicked. That card and its id is sent to the server who stores that card data into an array. The server passes the card data to all the clients to 
show the card flipping. If the array only has one card, the server allows
the player to have another turn. After the second card is passed to the server and stored, the server calls a function to check if both card ids match. If they do, points are 
awarded to the player, the cards are removed from the array, and the player gets passed another turn. If the cards do not match, the turn is passed to the other player and 
the cards are flipped back by the client.
- Card flips are used by using a class toggle in javascript to manipulate the css visibility.
- After all the cards are gone, the server checks who had the higher number of points and sends the winner to the clients, and updates the win/loss of players.
- The cards are all visible after the game is over and players can press ready again.
