/* Keep track of users in the room */
// "node users.js" to test

// array of users
const users = [];

function addUser({ id, name, roomID, src }) {
    // lowercase all
    let win = 0, loss = win, tie = win, points = win;
    let turn = false;

    // generate rgb player color
    const color = generateColor();
    // Create roomID for creator of room
    if (roomID == null) {
        // generate random 6 digit number
        roomID = generateNum(1000,9999);
        // check if duplicate ID
        const existingID = users.find((user) => {
            // return true if name and room are same as existing
            return user.roomID === roomID;
        });
        if (existingID) {
            roomID = generateNum(1000,9999);
        }
        // add user to array
        const user = { 
            id, name, roomID, src, win, loss, tie, points, turn, color
        };
        users.push(user);
        return { user };
    }

    roomID = parseInt(roomID);  
    // check for existing user, search array
    const existingUser = users.find( (user) => {
        // return true if name and room are same as existing\
        return user.name.toLowerCase() === name.toLowerCase() && user.roomID === roomID;
    });

    if (existingUser) {
        return {
            error: 'Name is in use'
        }
    }

    // add user to array
    const user = { 
        id, name, roomID, src, win, loss, tie, points, turn, color
     };
    users.push(user);
    return { user };
}

// remove user
function removeUser(id) {
    // look for index of matching id in array using findIndex
    const index = users.findIndex((user) => {
        return user.id === id; // will return the index of the id if found
    });

    if (index !== -1) { // id found in array
        return users.splice(index, 1)[0];
    }
}

// get user
function getUser(id) {
    // look for id, return if found
    const findUser = users.findIndex((user) => {
        return user.id === id;
    });

    if (findUser !== -1) {
        return users[findUser];
    }

    return {
        error: 'User not found'
    }
}

// get all users
function getUsersInRoom(roomID) {
    const userList = [];
    users.find((user) => {
        if (user.roomID === roomID) {
            userList.push(user);
        }
    });
    return userList;
}

function generateNum(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
} 

function generateColor() {
    const r = generateNum(0,255);
    const g = generateNum(0,255);
    const b = generateNum(0,255);
    const color = `rgb(${r},${g},${b})`;
    return color;
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}

