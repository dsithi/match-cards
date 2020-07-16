// parse url .. URLSearchParams is iterable object
const url = new URLSearchParams(location.search);
let username, room, img;
for (const [key, value] of url) {
    //console.log(`${key}:${value}`);
    if (key === 'username')
        username = value;
    if (key === 'room')
        room = value;
    if (key === 'img')
        img = value;
}

// load player images
window.onload = function loadImage() {
    document.getElementById('player1-img').src = img;
}
