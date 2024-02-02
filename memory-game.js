"use strict";

/** Memory game: find matching pairs of cards and flip both of them. */

const FOUND_MATCH_WAIT_MSECS = 1000;
let colors = []
let colorList = [];


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

function createCards(colors) {
  const gameBoard = document.querySelector(".board");
  gameBoard.replaceChildren();
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
    gameBoard.appendChild(card);
  }
}

//keeps track of flipped cards
let flippedCards = [];

//keeps track of score
let clicks = 0;
let score = document.createElement("div");
const menu = document.querySelector(".menu");
score.textContent = "Score: " + clicks;
menu.appendChild(score);

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
  const clickedCard = evt.target;
  if(!clickedCard.classList.contains("flipped")) {
    flipCard(clickedCard);
    flippedCards.push(clickedCard);
    clicks++;
    score.textContent = "Score: " + clicks;

  }
  if(flippedCards.length === 2) {
    if(flippedCards[0].className === flippedCards[1].className) {
      console.log("match");
      flippedCards = [];
    } else {
      //this allows users to keep clicking but not make flippedCards more than len 2 during the timeout;
      let temp1 = flippedCards[0];
      let temp2 = flippedCards[1];
      flippedCards = [];
      setTimeout(() => {
        unFlipCard(temp1);
        unFlipCard(temp2);
      }, 1200);
    }
  }
}


let slider = document.querySelector(".slider");
let pairs = 5;
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
  clicks = 0;
  score.textContent = "Score: " + clicks;
  generateColors()
  let shuffledColors = shuffle(colors);
  createCards(shuffledColors);
});