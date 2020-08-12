// Keep track of cards for the game - - Array of objects that include roomID and cards array
//                                      - Create/Get/Add Cards

// store the game cards in an array, have function to randomize the array and pass to all clients
const pre = 'icons/';
const gameCards = 
    [
        `${pre}milk.svg`,`${pre}milk.svg`,`${pre}breakfast.svg`,`${pre}breakfast.svg`,
        `${pre}pie.svg`,`${pre}pie.svg`,`${pre}rice.svg`,`${pre}rice.svg`,
        `${pre}steak.svg`,`${pre}steak.svg`,`${pre}watermelon.svg`,`${pre}watermelon.svg`,
        `${pre}chicken.svg`,`${pre}chicken.svg`,`${pre}burger.svg`,`${pre}burger.svg`,
        `${pre}noodles.svg`,`${pre}noodles.svg`,`${pre}sausage.svg`,`${pre}sausage.svg` 
    ];
const cards = [];

// createCards(): New array with randomized order - Push an object to array
function createCards(roomId) {
    // New array of cards for each new room
    const cardArr = Array.from(gameCards);
    // check for duplicates
    const check = cards.forEach((room) => {
        if (room.roomId === roomId);
    });
    
    // Add to array
    if (!check) {
        const newCards = { roomId: roomId, cardSet: cardArr } 
        cards.push(newCards);
    }
}

// getSet(roomId): Return the array of cards
function getSet(roomId) {
    const cardList = [];
    cards.find((card) => {
        if (card.roomId === roomId) {
            cardList.push(card);
        }
    });
    return cardList[0].cardSet;
}

// randomizeCards(roomId): Take in ID, randomize array of cards in that id
function randomizeCards(cardsArr) {
    // Randomize image sources/id
    for (let i = 0; i < cardsArr.length; i++) {
        const j = Math.floor(Math.random()* i);
        const temp = cardsArr[i];
        cardsArr[i] = cardsArr[j];
        cardsArr[j] = temp;
    }

    return cardsArr;
}
/*
createCards(43);
createCards(1);

const cards1 = getSet(43)
const cards2 = getSet(1)

//console.log(cards1);
randomizeCards(cards1);
console.log(cards)
*/
// Create card -> Store card set in variable -> Use that variable to randomize card

module.exports = {
    createCards,
    getSet,
    randomizeCards
}