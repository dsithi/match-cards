

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
function playState() {
    const card = document.querySelectorAll('.card');
    card.forEach(card => {
        card.addEventListener('click', flipCard);
    });
}

function flipCard() {
    // Allow two flips per turn?
    if(cardCount < 2) {
        this.classList.toggle('flipped', true);
        cardCount++;
        if (cardCount == 1){
            // Set firstCard to first card clicked
            firstCard = this;
        }
        if (cardCount == 2){
            secondCard = this;
            checkMatch();
        }
            
    }
}


function checkMatch() {
    if (firstCard.dataset.img === secondCard.dataset.img) {
        console.log(`${firstCard.dataset.img} is equal to ${secondCard.dataset.img}`);
        cardCount = 0;
        // remove element
        firstCard.style.visibility = 'hidden';
        secondCard.style.visibility = 'hidden';

    }
    else {
        console.log(`${firstCard.dataset.img} is not equal to ${secondCard.dataset.img}`);
        hideCards();
    }
}

function showCards() {
    const card = document.querySelectorAll('.card');
    card.forEach(card => {
        card.classList.toggle('flipped', true);
    });
}

function hideCards() {
    const card = document.querySelectorAll('.card');
    card.forEach(card => {
        card.classList.toggle('flipped', false);
    });
}


function flipBack() {
    this.classList.toggle('flipped', false);
}
// End state: - Check points to see who won
//            - Return Victory or Defeat screen
//            - Update W/L/T
//            - Call IdleState 
function endState() {

}
// Victory Screen

// Defeat Screen

/* Export functions?? */


function off() {
    document.getElementById("overlay").style.display = "none";
  }
  function on() {
    document.getElementById("overlay").style.display = "block";
  }