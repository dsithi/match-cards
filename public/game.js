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
        // Pass in dataset value to playerClick
        //console.log("id" + this.dataset.img)
        const cardId = this.id;
        const dataId = this.dataset.img
        cardCount++;  
        // Send back to server
        socket.emit('playerClick', cardId, dataId);     
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

  // enable/disable button
  function disableReady() {
    document.getElementById('rdy').setAttribute('disabled', true);
    document.getElementById('rdy').style.backgroundColor = "#1E1B22";
    document.getElementById('rdy').style.cursor = "default";
  }

  function enableReady() {
    document.getElementById('rdy').removeAttribute('disabled');
    document.getElementById('rdy').style.backgroundColor = "#2A4465";
    document.getElementById('rdy').style.cursor = "pointer";
  }