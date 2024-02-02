"use strict";

/** Memory game: find matching pairs of cards and flip both of them. */

const FOUND_MATCH_WAIT_MSECS = 1000;
let colors = []

function generateColors() {
  colors = [];
  for(let i = 0; i < pairs; i++) {
    //using # + Math.floor(Math.random()*16777215).toString(16) resulted in invalid colors generating quite often
    let randomColor = '#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0').toUpperCase();
    colors.push(randomColor);
    colors.push(randomColor);
  }
}



/** Shuffle array items in-place and return shuffled array. */

function shuffle(items) {
  // This algorithm does a "perfect shuffle", where there won't be any
  // statistical bias in the shuffle (many naive attempts to shuffle end up not
  // be a fair shuffle). This is called the Fisher-Yates shuffle algorithm; if
  // you're interested, you can learn about it, but it's not important.

  for (let i = items.length - 1; i > 0; i--) {
    // generate a random index between 0 and i
    let j = Math.floor(Math.random() * i);
    // swap item at i <-> item at j
    [items[i], items[j]] = [items[j], items[i]];
  }

  return items;
}

/** Create card for every color in colors (each will appear twice)
 *
 * Each div DOM element will have:
 * - a class with the value of the color
 * - a click event listener for each card to handleCardClick
 */
const board = document.querySelector(".board");
function createCards(colors) {
  board.replaceChildren();
  for (let color of colors) {
    const card = document.createElement("div");
    card.classList.add(color);
    card.classList.add("card")
    const front = document.createElement("div");
    const back = document.createElement("div");
    front.classList.add("face");
    front.classList.add("front");
    back.classList.add("face");
    back.classList.add("back");
    card.appendChild(front);
    card.appendChild(back);
    card.addEventListener("click", handleCardClick);
    board.appendChild(card);
  }
}

//keeps track of flipped cards
let flippedCards = [];

//keeps track of score
let clicks = 0;
const score = document.createElement("div");
score.className = "score";
const menu = document.querySelector(".menu");
score.textContent = "Score: " + clicks;
menu.appendChild(score);

//create empty winner message
const winnerMessage = document.createElement("div");
menu.appendChild(winnerMessage);


/* I made a boolean to lock out the user from spam-clicking. I tried using temp variables, but when the list of colors is too small,
the user can brute-force a win by just clicking as fast as they can. I don't prefer the click lockout, but it's currently the only solution
I could think of */
let lock = false;

/** Flip a card face-up. */

function flipCard(card) {
  card.classList.add("flipped");
  card.children[1].style.background = card.classList[0];
  card.children[1].textContent = card.classList[0];
}

/** Flip a card face-down. */

function unFlipCard(card) {
  card.classList.remove("flipped");
}

/** Handle clicking on a card: this could be first-card or second-card. */

function handleCardClick(evt) {
  if(lock) {
    return;
  }
  const clickedCard = evt.target;
  if(!clickedCard.classList.contains("flipped")) {
    flipCard(clickedCard);
    flippedCards.push(clickedCard);
    clicks++;
    score.textContent = "Score: " + clicks;
  }
  if(flippedCards.length === 2) {
    if(flippedCards[0].className === flippedCards[1].className) {
      flippedCards = [];
    } else {
      lock = true;
      setTimeout(() => {
        unFlipCard(flippedCards[0]);
        unFlipCard(flippedCards[1]);
        flippedCards = [];
        lock = false;
      }, 1000);

    }
  }
  if(checkWin()) {
    winnerMessage.textContent = "You win with a score of " + clicks + '! 🎉🥳 (Click "New Game!" to play again)';
    if(localStorage[pairs] === undefined || localStorage[pairs] > clicks) {
      localStorage.setItem(pairs, clicks);
    }
    generateLeaderboard();
  }
}

function checkWin() {
  let allFlipped = true;
  for(const child of board.children) {
    if(!child.classList.contains("flipped")) {
      allFlipped = false;
    }
  }
  return allFlipped;
}

let slider = document.querySelector(".slider");
let pairs = 6;
slider.addEventListener("input", evt => {
  pairs = evt.target.value;
  const sliderLabel = document.querySelector(".slider-label");
  if(pairs > 20) {
    sliderLabel.textContent = pairs + " Pairs to Match (Good Luck)";
  } else if(pairs > 10) {
    sliderLabel.textContent = pairs + " Pairs to Match (More than 10 pairs may make the game unfun)";
  } else if(pairs > 1) {
    sliderLabel.textContent = pairs + " Pairs to Match";
  } else {
    sliderLabel.textContent = "Click the two cards to win"
  }
});
let start = document.querySelector(".start");
start.addEventListener("click", evt => {
  //the game would crash if user resets during flipping animation
  if(lock) {
    return
  }
  flippedCards = [];
  clicks = 0;
  score.textContent = "Score: " + clicks;
  winnerMessage.textContent = "";
  generateColors()
  let shuffledColors = shuffle(colors);
  createCards(shuffledColors);
});

function generateLeaderboard() {
  let sortedStorage = sortObj(localStorage);
  const leaderboard = document.querySelector(".leaderboard");
  leaderboard.replaceChildren();
  for(const key in sortedStorage) {
    let hiScore = document.createElement("tr");
    let hiPair = document.createElement("th");
    hiPair.textContent = key;
    let hiClicks = document.createElement("th");
    hiClicks.textContent = sortedStorage[key];
    hiScore.appendChild(hiPair);
    hiScore.appendChild(hiClicks);
    leaderboard.appendChild(hiScore);
  }
}
function sortObj(obj) {
  const sortedKeys = Object.keys(obj).sort((a, b) => a - b);
  const sortedObj = {};
  for(const val of sortedKeys) {
    sortedObj[val] = obj[val];
  }
  return sortedObj;
}

const wipe = document.querySelector(".wipe");
wipe.addEventListener("click", evt => {
  localStorage.clear();
  generateLeaderboard();
});
generateLeaderboard();
