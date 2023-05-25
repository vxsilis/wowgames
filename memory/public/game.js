const cards = document.querySelectorAll(".card");


let matched = 0; // how many pairs of cards have been matched
let cardOne, cardTwo; //first and second card that a player picks to flip
let disableDeck = false; //disable clicking while checking for matching cards
var cardnowID;


// load sound files
var lost = new Audio('sounds/lost.mp3');
var won = new Audio('sounds/won.mp3');
var played = new Audio('sounds/played.mp3');
var turn = new Audio('sounds/turn.mp3');


var myscore = 0;
var turnp; // who's turn


// get whos just played from script.js after gameState
function sendTurn(turn) {
    turnp = turn;
}


// this function is called when "I" flip a card
function flipCard({target: clickedCard}) {

    // get id of clicked card
    cardnowID = $(clickedCard).attr('id');

    if (cardOne !== cardnowID && !disableDeck) {
        clickedCard = "#" + cardnowID;
        $(clickedCard).addClass("flip");
        if (!cardOne) {
            // it is the first card i flip 
            iflipped(cardnowID);
            return cardOne = clickedCard;
        }
        // i flipped two cards
        cardTwo = clickedCard;
        disableDeck = true;
        // get the name of the two images
        let cardOneImg = $(cardOne).find(".back-view img").attr("src"),
            cardTwoImg = $(cardTwo).find(".back-view img").attr("src");
        // check if they match
        matchCards(cardOneImg, cardTwoImg);
    }
}



// flip the opponent's card 
function flipOpp(move) {
    var clickedCard = "#" + move;
    if (cardOne !== clickedCard && !disableDeck) {
        $(clickedCard).addClass("flip");
        if (!cardOne) {
            // it is the first card opponent flips
            return cardOne = clickedCard;
        }
        // opponent flipped two cards
        cardTwo = clickedCard;
        disableDeck = true;
        // get the name of the two images
        let cardOneImg = $(cardOne).find(".back-view img").attr("src"),
            cardTwoImg = $(cardTwo).find(".back-view img").attr("src");
        // check if they match
        matchCards(cardOneImg, cardTwoImg);
    }
}


// check if cards match
function matchCards(img1, img2) {
    if (img1 === img2) {
        // they match. play sound
        if (localStorage.sound == 'true') {
            played.play();
        }
        matchedf();
        // remove event listeners
        $(cardOne).off();
        $(cardTwo).off();
        cardOne = cardTwo = "";
        return disableDeck = false;
    }
    // if they dont match add class to play animation
    setTimeout(() => {
        $(cardOne).addClass("shake");
        $(cardTwo).addClass("shake");
    }, 400);
    // remove classes so animation stops and card flips again/hides
    setTimeout(() => {
        $(cardOne).removeClass("shake flip");
        $(cardTwo).removeClass("shake flip");
        cardOne = cardTwo = "";
        disableDeck = false;
    }, 1200);
    // change turn
    if (turnp != myname) {
        iflipped(cardnowID);
        changeTurn(cardnowID, myscore);
    }
}


// cards MATCH!
function matchedf() {
    // increase counter
    matched++;
    
    if (turnp != myname) { // currently my turn
        // myscore++;
    
        if (matched == 8) {
            // myscore++;

            // update score for now 

//             if (localStorage.scorenum = "#playeronescore"){
//                 myscore++;
//                 scoreone++;
                
//             }else{
//                 myscore++;
//                 scoretwo++;
                
//             }         


            // check which player has highest score and call the function with the right parameters
            if (scoreone > scoretwo) {
                winner(cardnowID, "p1");
            } else if (scoreone < scoretwo) {
                winner(cardnowID, "p2");
            } else {
                // there is a draw
                // isopalia(); 
                setTimeout(() => {
                    return isopalia();
                }, 1000);
            }
        } else {
            myscore++;
            // print it
            $(localStorage.scorenum).html(myscore);
            // call function to show which card i flipped and change turn
            iflipped(cardnowID);
            changeTurn(cardnowID, myscore);
        }
    }
}



// HOW TO BUTTON
$('.howto').click(function() {

    $('.rules').toggleClass("open");
});


// SOUND CONTROL

//check the input of the toggle on click

$("#audio_icon_off").click(function() {
    $("#audio_setting").prop("checked", false);
});
$("#audio_icon_on").click(function() {
    $("#audio_setting").prop("checked", true);
});

// based on players preference the sound is gonna get the desired setting
if (localStorage.sound == 'true') {
    $("#audio_setting").prop("checked", true);
} else {
    $("#audio_setting").prop("checked", false);
}


// trigger the click 2 times so it is initialized to the right setting
$("#audio_setting").click();
setTimeout(() => {
    $("#audio_setting").click();
}, 0);

// css animations for the toggle icons
$("#audio_setting").change(function() {
    if (this.checked) {
        localStorage.sound = 'true';
        $("#icon_on").css({
            opacity: 1,
            left: "45px"
        });
        $("#icon_off").css({
            opacity: 0,
            left: "45px"
        });
    } else {
        localStorage.sound = 'false';
        $("#icon_on").css({
            opacity: 0,
            left: "5px"
        });
        $("#icon_off").css({
            opacity: 1,
            left: "5px"
        });
    }
});
