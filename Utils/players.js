
// store users who will be playing in array, cards sent by users
const playerList = [];
const cards = [];



function playerReady(player) {
    const existingID = playerList.find((user) => {
        // return true if name and room are same as existing
        return user.id === player.id;
    });

    if (!existingID) {
        playerList.push(player);
    }
}

function playerUnready(id){
    // look for index of matching id in array using findIndex
    const index = playerList.findIndex((user) => {
        return user.id === id; // will return the index of the id if found
    });

    if (index !== -1) { // id found in array
        return playerList.splice(index, 1)[0];
    }    
}

function getPlayers(roomID) {
    const players = [];
    playerList.find((user) => {
        if (user.roomID === roomID) {
            players.push(user);
        }
    });
    return players;
}

// look for player turn true
function findTurn(roomID) {
    const players = [];
    playerList.find((user) => {
        if (user.roomID === roomID) {
            if (user.turn === true) {
                players.push(user);
            }
        }
    });
    return players;
}

// Take in card object and store the roomID and cardID
function addCard(card) {
    console.log(card)
    const findCard = cards.find((el) => {
        return card.roomID === el.roomID && card.cardID === el.cardID;
    });
    if (!findCard) {
        cards.push(card);
    }
}

// Search for roomID and cardID
function removeCard(roomID) {
    for (let i = 0; i < cards.length; i++) {
        if (cards[i].roomID === roomID) {
            cards.splice(i, 1);
        }
    }
  
}

function getCards(roomID) {
    const cardList = [];
    cards.find((user) => {
        if (user.roomID === roomID) {
            cardList.push(user);
        }
    });
    return cardList;
}

// Search for matching cardID
function checkMatch(cardList) {
    const cards = [];
    cardList.forEach( ({ roomID, cardID, dataID }) => {
        // remove number from card id
        //cardID = cardID.slice(0, -1);
        cards.push({roomID: roomID, cardID: cardID, dataID: dataID});
    });
    if (cards.length === 2) {
        if (cards[0].dataID === cards[1].dataID) {
            return true;
        }
    }
    else {
        return false;
    }

}


/*
const num1 = { roomID: 666, cardID: 'burger1' };
const num2 = { roomID: 666, cardID: 'burger2' };
const num3 = { roomID: 111, cardID: 'burger1' };
const num4 = { roomID: 666, cardID: 'burger2' };
const num5 = { roomID: 111, cardID: 'burger12' };

addCard(num1);
addCard(num2);
addCard(num3);
addCard(num4);
addCard(num5);

console.log(getCards(666))
removeCard(666);
//removeCard(666);
console.log(getCards(666))*/




module.exports = {
    playerReady,
    playerUnready,
    getPlayers,
    findTurn,
    addCard,
    removeCard,
    getCards,
    checkMatch,
}
