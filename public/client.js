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
    users.forEach( ({ id, name, roomID, src, win, loss, tie, points, turn, color  }) => {
        // update player info in DOM
        outputPlayerInfo(name, roomID, src, win, loss, tie, points, turn, color);

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





// Take in name and sprites array from the server, update the DOM with div
function outputPlayerInfo(name, roomID, src, win, loss, tie, points, turn, color ) {
    document.getElementById('roomName').innerHTML = `Room ID: ${roomID}`;
    const container = document.querySelector('.info-grid');
    const div = document.createElement('div');
    div.setAttribute('class', 'info');
    div.innerHTML = `               
                        <h3>${name}</h3>
                        <p class="points">${points} PTS</p>
                        <img src="avatars/${src}" style="background-color: ${color}">
                        <ul class="scores">
                            <p class="score-value">W</p>
                            <p class="num">${win}</p>
                            <p class="score-value">L</p>
                            <p class="num">${loss}</p>
                            <p class="score-value">T</p>
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
