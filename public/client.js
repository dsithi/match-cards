// create socket that will connect to server
const socket = io();

const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');

// parse URL for name
const { name, src, roomID } = Qs.parse(location.search, {ignoreQueryPrefix: true});

// Send url data to server, callback error
socket.emit('join', { name, src, roomID }, (error) => {
    alert('Error: name is in use, game ID does not exist, or the room is full')
    return window.location.href = "/";
});

// Receive updated player data
socket.on('updateData', ({ users }) => {
    // deconstruct the object properties
    const container = document.querySelector('.info-grid');
    container.innerHTML = '';

    // Update each player dom
    users.forEach( ({ id, name, roomID, src, win, loss, tie, points, turn, color }) => {
        // update player info in DOM
        outputPlayerInfo(name, roomID, src, win, loss, tie, points, turn, color);
        if (turn) {
            // Outline player
            highlightPlayer(name.trim());
        }
    });
})

// Send Chat Message to the server
// Event listener for message form
chatForm.addEventListener('submit', (e) => {
    // prevent the form from submitting
    e.preventDefault();

    // store message value
    let msg = document.getElementById('msg').value;
    
    // send msg to server
    socket.emit('chatMessage', msg);

    // clear the message
    document.getElementById('msg').value = '';
    document.getElementById('msg').focus();
});

// Receive chat message from user, output to DOM
socket.on('message', message => {  // receive object containing name, image, message, time
    outputMessage(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}); 


let isReady = false;
let count = 0;

// Credits
document.getElementById('credits').addEventListener('click', () => {
    // Show popup
    document.getElementById('popup').style.visibility = "visible";
});

document.getElementById('close').addEventListener('click', () => {
    // Hide popup
    document.getElementById('popup').style.visibility = "hidden";
});

// Ready button event listener
document.getElementById('rdy').addEventListener('click', sendReady, false);

function sendReady() {
    // Check if 2/2 players have already pressed ready
    console.log(count)
    socket.emit('checkPlayers');
}
// Receive number of players ready'd up
socket.on('playerNum', playerNum => {
    if (count === 0) {
        if ((playerNum === 0 || playerNum === 1)) { // No player had clicked ready
            if(!isReady) {
            // Allow click
            isReady = true;

            // change bg color
            document.getElementById('rdy').style.backgroundColor = "#778da9";

            // send to server
            socket.emit('playerReady');
            count++;
             }
        }
     }
     
    else if (count === 1) {
        if ((playerNum === 0 || playerNum === 1)) {
            if (isReady) {
            // Unready
            isReady = false;

            // change bg color
             document.getElementById('rdy').style.backgroundColor = "#2A4465";

            socket.emit('playerUnready');
            count--;
            }
        }
    }

});
// Listen for game start
socket.on('countdown', () => {
    // Send countdown
    countdownOn();
    showCards();
    disableReady();
});

// Listen for randomize cards, update the client
socket.on('randomizeCards', cards => {
    // Change dataset of each card
    const cloneCards = Array.from(cards);
    const cardDiv = document.querySelectorAll('.card');
    cardDiv.forEach(card => {
        card.dataset.img = cloneCards.pop();
    })

    // Loop through back-cards class and change src
    const backCard = document.querySelectorAll('.back-card');
    backCard.forEach(card => {
        card.src = cards.pop();
    });
});

// Listen for players turn.. send function to click card
socket.on('playerTurn', playerData => {
    // Click card
    if (playerData.turn) {
        setTimeout(()=> {
            playTurn();
        }, 500);
    }   
});

// Check if the game has started when 3rd/3th user joins
socket.on('checkStarted', playerNum => {
    if (playerNum === 2) {
        // Disable ready
        disableReady();
    }
});

// Listen for game over: reset the cards visibility, change text to winner, enable ready, isReady to false
socket.on('gameOver', (winner) => {
    socket.emit('playerUnready');
    document.getElementById('countdown').innerHTML = "";

    // Display winner in DOM
    if (winner === 'TIE' || winner === 'Game Over') {
        document.getElementById('turn').innerHTML = `${winner}!!!`;
    }
    else {
        document.getElementById('turn').innerHTML = `${winner} is the winner!!!`;
    }

    // Enable the ready button
    enableReady();
    count = 0;
    isReady = false;

    // Show cards again after 1 second
    setTimeout(()=> {
        const card = document.querySelectorAll('.card');
        card.forEach(card => {
            card.classList.remove('hide');
            card.classList.remove('noclick');
            card.classList.toggle('flipped', false);
        });
    }, 1000);
});

socket.on('resetButton', () => {
    setTimeout(()=>{
    // Unready
    isReady = false;

    // change bg color
    document.getElementById('rdy').style.backgroundColor = "#2A4465";
     socket.emit('playerUnready');
    });
});

// Update data when game over
socket.on('endData', ({ users }) => {
    // deconstruct the object properties
    const container = document.querySelector('.info-grid');
    container.innerHTML = '';
    users.forEach( ({ id, name, roomID, src, win, loss, tie, points, turn, color }) => {
        // update player info in DOM
        outputPlayerInfo(name, roomID, src, win, loss, tie, points, turn, color);

        setTimeout(()=> {
        // remove Outline player
            removeHighlight(name.trim());
        }, 1000);
    });
});

// Change DOM of player turn
socket.on('playerName', playerData => {
    document.getElementById('turn').innerHTML = `[ ${playerData.name} ]'s Turn`;
     highlightPlayer(playerData.name.trim());
});

// Change DOM of card flip
socket.on('cardFlip', cardId => {
    document.getElementById(cardId).classList.toggle('flipped', true);
    document.getElementById(cardId).classList.toggle('noclick', true);
});

// Change DOM to remove cards
socket.on('removeCards', (firstCard, secondCard) => {
    setTimeout(()=> {
        document.getElementById(firstCard).classList.toggle('hide', true);
        document.getElementById(firstCard).classList.toggle('noclick', true);
        //document.getElementById(firstCard).style.pointerEvents = 'none';
        document.getElementById(secondCard).classList.toggle('hide', true);
        document.getElementById(secondCard).classList.toggle('noclick', true);
        //document.getElementById(secondCard).style.pointerEvents = 'none';
    }, 600)

});

// Flip cards back
socket.on('flipCards', (firstCard, secondCard, name) => {
    name = name.trim();
    setTimeout(() => {
        flipBack(firstCard);
        flipBack(secondCard);
    }, 1000);
    removeHighlight(name);
});


// Take in name and sprites array from the server, update the DOM with div
function outputPlayerInfo(name, roomID, src, win, loss, tie, points, turn, color) {
    document.getElementById('roomName').innerHTML = `Room ID: ${roomID}`;
    const container = document.querySelector('.info-grid');
    const div = document.createElement('div');
    div.setAttribute('class', 'info');
    const nameId = name.trim();

    div.innerHTML = `               
        <h3>${name}</h3>
        <p class="points">${points} PTS</p>
        <img id="${nameId}" src="avatars/${src}" style="background-color: ${color}">
        <ul class="scores">
            <p class="score-value">Win</p>
            <p class="num">${win}</p>
            <p class="score-value">Loss</p>
            <p class="num">${loss}</p>
            <p class="score-value">Tie</p>
            <p class="num">${tie}</p>
        </ul>`;
    container.appendChild(div);
}

// update DOM with new messages
function outputMessage(message) {
    const container = document.querySelector('.chat-messages');
    const div = document.createElement('div');
    div.classList.add('msg-container');
    div.innerHTML = `   <span class="msg-name">${message.name}</span>
                        <span class="msg-time">at ${message.time}</span> 
                        <div class="img-msg">
                            <div>
                                <img src="avatars/${message.image}" style="background-color: ${message.color}">
                            </div>
                            <div class="message">
                                <p class="msg-text">${message.text}</p>
                            </div>
                        </div>`                
    container.appendChild(div);    
}

function highlightPlayer(name) {
    setTimeout(()=> {
        const player = document.getElementById(name);
        player.style.borderWidth = "thin";
        player.style.borderColor = "transparent";
        player.style.transform = "scale(1.2)";
        player.style.transition = ".2s ease-in";
    }, 1000);

}

function removeHighlight(name) {
    const player = document.getElementById(name);
    player.style.borderWidth = "thin";
    player.style.borderColor = "black";
    player.style.transform = "none";
    player.style.transition = ".2s ease-in";

}

function enableReady() {
    document.getElementById('rdy').removeAttribute('disabled');
    document.getElementById('rdy').style.backgroundColor = "#2A4465";
    document.getElementById('rdy').style.cursor = "pointer";
}

function disableReady() {
    // Disable ready button (re-enable on game over)
    document.getElementById('rdy').setAttribute('disabled', true);
    document.getElementById('rdy').style.backgroundColor = "#1E1B22";
    document.getElementById('rdy').style.cursor = "default";
}