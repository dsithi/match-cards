

// Idle state: - Randomize Cards
//             - Wait for players to ready
function idleState() { /* Adjust for server/client .. return images?*/
    // Image array
    const pre = 'Assets/images/icons/';
    const images = [
        `${pre}Gyudon.png`,`${pre}Gyudon.png`,`${pre}Miso_Soup.png`,`${pre}Miso_Soup.png`,
        `${pre}Narutomaki.png`,`${pre}Narutomaki.png`,`${pre}Nigiri_01.png`,`${pre}Nigiri_01.png`,
        `${pre}Onigiri.png`,`${pre}Onigiri.png`,`${pre}Ramen.png`,`${pre}Ramen.png`,
        `${pre}Salmon_Roll.png`,`${pre}Salmon_Roll.png`,`${pre}Shrimp_02.png`,`${pre}Shrimp_02.png`,
        `${pre}Soy_Sauce.png`,`${pre}Soy_Sauce.png`,`${pre}Takoyaki.png`,`${pre}Takoyaki.png` 
    ]
    // Randomize image sources/id ?
    for (let i = 0; i < images.length; i++) {
        const j = Math.floor(Math.random()* i);
        const temp = images[i];
        images[i] = images[j];
        images[j] = temp;
    }
    // Loop through back-cards class and change src
    const backCard = document.querySelectorAll('.back-card');
    backCard.forEach(card => {
        card.src = images.pop();
        //card.style.visibility = 'visible'
    });
    
}


// Play state:  - Chat Message, show cards one by one, track player turn
//              - keep track of total cards, points on correct, allow two clicks (reset on right)
//              - countdown(resets), Call EndState when cards reach 0  
let cardCount = 0;
let firstCard, secondCard;
let canClick = true;
let cardId = "";

function playTurn() {
    cardCount = 0;
    const card = document.querySelectorAll('.card');
    card.forEach(card => {
        card.addEventListener('click', flipCard); 
    });
}


function flipCard() {
    if (cardCount < 1) {
        this.classList.toggle('flipped', true);
        //firstCard = this.dataset.img;
        console.log("id" + this.id)
        cardId = this.id;
        cardCount++;  
        // Send back to server
        socket.emit('playerClick', cardId);     
    }  
}

function showCards() {
    setTimeout(() => {
        const card = document.querySelectorAll('.card');
        card.forEach(card => {
            card.classList.toggle('flipped', true);
        });
        hideCards();
    }, 4000);

}

function hideCards() {
    setTimeout(()=> {
        const card = document.querySelectorAll('.card');
        card.forEach(card => {
            card.classList.toggle('flipped', false);
        });
    }, 800);
}


function flipBack(card) {
    document.getElementById(card).classList.toggle('flipped', false);
}
// End state: - Check points to see who won
//            - Return Victory or Defeat screen                                                 
//            - Update W/L/T
//            - Call IdleState 
function endState() {

}
// Victory Screen

// Defeat Screen


function countdownScreen() {
    let count = 3;
    const countdownTimer = setInterval(() => {
        if (count <= 0) {
            clearInterval(countdownTimer);
            countdownOff();
            // Call game start function
        }
        else {
            document.getElementById('countdown').innerHTML = count;
        }
        count -= 1;
    }, 1000);
}

function countdownOff() {
    document.getElementById("overlay").style.display = "none";
  }
  function countdownOn() {
    document.getElementById("overlay").style.display = "block";
    countdownScreen();
  }