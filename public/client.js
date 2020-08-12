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
// Ready button event listener
document.getElementById('rdy').addEventListener('click', (e) => {
    // Check if 2/2 players have already pressed ready
    socket.emit('checkPlayers');

    // Receive number of players ready'd up
    socket.on('playerNum', playerNum => {
        if ((playerNum === 0 || playerNum === 1) && count === 0) { // No player had clicked ready
            // Allow click
            isReady = true;
            // change bg color
            document.getElementById('rdy').style.backgroundColor = "#778da9";
            // send to server
            socket.emit('playerReady');
            count++;
        }
        else if (isReady && (playerNum === 0 || playerNum === 1) && count === 1) {
            // Unready
            isReady = false;
            // change bg color
            document.getElementById('rdy').style.backgroundColor = "#2A4465";
            socket.emit('playerUnready');
            count--;
        }
    });
});

// Listen for game start
socket.on('countdown', () => {
    // Send countdown
    countdownOn();
    showCards();

    isReady = false;
    disableReady();

});

// FIX IDS

// Listen for randomize cards, update the client
socket.on('randomizeCards', cards => {
    // Change dataset of each card
    const cloneCards = Array.from(cards);
    const cardDiv = document.querySelectorAll('.card');
    cardDiv.forEach(card => {
        card.dataset.img = cloneCards.pop();
    })
    // Loop through back-cards class and change src
    //console.log(cards)
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

// Change DOM of player turn
socket.on('playerName', playerData => {
    document.getElementById('turn').innerHTML = `[ ${playerData.name} ]'s Turn`;
     highlightPlayer(playerData.name.trim());
});

// Change DOM of card flip
socket.on('cardFlip', cardId => {
    document.getElementById(cardId).classList.toggle('flipped', true);
    //console.log(document.getElementById(cardId).dataset.img)
});

// Change DOM to remove cards
socket.on('removeCards', (firstCard, secondCard) => {
    document.getElementById(firstCard).style.opacity = '1';
    document.getElementById(secondCard).style.opacity = '1';
    
    setInterval(()=> {
        document.getElementById(firstCard).style.transition = 'hidden 1s opacity 1s';
        document.getElementById(secondCard).style.transition = 'hidden 1s opacity 1s';
        document.getElementById(firstCard).style.visibility = 'hidden';
        document.getElementById(secondCard).style.visibility = 'hidden';
        document.getElementById(firstCard).style.opacity = '0';
        document.getElementById(secondCard).style.opacity = '0';
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
        player.style.transition = ".5s ease-in";
    }, 1000);

}

function removeHighlight(name) {
    const player = document.getElementById(name);
    player.style.borderWidth = "thin";
    player.style.borderColor = "black";
    player.style.transform = "none";
    player.style.transition = ".3s ease-in";

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