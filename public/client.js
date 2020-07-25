// create socket that will connect to server
const socket = io();

// parse URL for name
const { name, src, roomID } = Qs.parse(location.search, {ignoreQueryPrefix: true});

socket.emit('join', { name, src, roomID }, (error) => {
    alert('Error: name is in use, game ID does not exist, or the room is full')
    return window.location.href = "/";
});






// Take in name and sprites array from the server, update the DOM with div
function outputPlayerInfo(name, sprite) {
    const container = document.querySelector('.info-grid');
    const div = document.createElement('div');
    div.setAttribute('class', 'info');
    div.innerHTML = `               
                        <h3>${name}</h3>
                        <p class="points">1000 PTS</p>
                        <img class="image" src="${sprite}">
                        <ul class="scores">
                            <p class="score-value">W</p>
                            <p class="num">1</p>
                            <p class="score-value">L</p>
                            <p class="num">1</p>
                            <p class="score-value">T</p>
                            <p class="num">1</p>
                        </ul>`;
    container.appendChild(div);
}