// load sound files
var lost = new Audio('sounds/lost.mp3');
var won = new Audio('sounds/won.mp3');
var played = new Audio('sounds/played.mp3');
var turn = new Audio('sounds/turn.mp3');

const squares = document.querySelectorAll('.square');

// the array with every positioned piece. 0= no piece, 1=i placed a piece, 2=opponent placed a piece

var gridArr = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
];

// the potential icons for every player
var player1 = ["cherry", "pretzel", "canoe"];
var player2 = ["leaf", "ball", "racket"];

// choose random icon
var randomIndex = Math.floor(Math.random() * player1.length);

// make a img HTML element for every player that containes the icon from the arrays above
var playericon = ' <img class="player1" src="images/' + player1[randomIndex] + '.png"> ';
var oppicon = ' <img class="player2" src="images/' + player2[randomIndex] + '.png"> ';

var checkforlosernow;

//counter for how many degrees we have to rotate elements
var rotateValueIcon = 0;

// add click listener for every square 
squares.forEach((square) => {
    square.addEventListener('click', iplayed);
});

// check if the array is full (there are no zeros left)
function isFull(arr) {
    let hasZero = false;

    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr[i].length; j++) {
            if (arr[i][j] === 0) {
                hasZero = true;
                break;
            }
        }
        if (hasZero) {
            break;
        }
    }

    return !hasZero;
}

// rotates the main board -90deg than previous position and icons (imgs) +90 
function rotate() {

    var imgs = document.querySelectorAll('.square img');
    console.log(imgs);
    rotateValueIcon += 90;
    console.log(rotateValueIcon, "rotateValue");
    imgs.forEach((img) => {

        var divElement = img;

        divElement.style.transform = "rotate(" + rotateValueIcon + "deg)";

    });

    var board = document.querySelector('#board');

    var divElement = board;
    var transformValue = window.getComputedStyle(divElement).getPropertyValue('transform');
    var matrixValues = transformValue.match(/matrix\((.+)\)/)[1].split(',').map(parseFloat);
    var rotateValue = Math.atan2(matrixValues[1], matrixValues[0]) * (180 / Math.PI);
    rotateValue -= 90;
    divElement.style.transform = "translate(-50%,-50%) rotate(" + rotateValue + "deg)";

}

// this function is called when player 1 (the player that look the window) clicks a square on the board

function iplayed(e) {

    // console.log(this);

    // get id of square
    var idNow = $(this).attr('id');
    console.log("idnow" + idNow);

    // get 1st and 2nd character of id in order to understand row and column of the square
    var firstDigitNum = Number(String(idNow)[0]);

    var lastDigitNum = Number(String(idNow).slice(-1));

    // place "1" in the coordinate 
    gridArr[firstDigitNum][lastDigitNum] = 1;

    // add the img symbol of player 1
    $(this).html(playericon);
    // remove click listener
    e.target.removeEventListener("click", iplayed);

    //rotate everything
    rotate();

    // playsound id the sound toggle is on
    if (localStorage.sound == 'true') {
        played.play();
    }

    // call function from script js to send the move to server
    iPlayedToServer(idNow);

    setTimeout(() => {
        //check if this move was a loser move
        checkforlosernow = checkForLoser(gridArr);

        if (checkforlosernow != null) {
            // if "I" lost (the player who looks at the screen)
            if (checkforlosernow == 1) {

                // disappear elements like game board and titles  
                $("#board").css("display", "none");
                $("#whosturn").css("display", "none");
                $("#winner-message").css("display", "block");

                if (localStorage.sound == 'true') {
                    lost.play();
                }

                // add YOU LOST 
                $("#winner-message").html("YOU LOST!");
                $(".final-messages").css("display", "flex");

                // based on 1v1 or tourname player get redirected to the right page
                if (localStorage.type == "one") {
                    $("#win-buttons").css("display", "flex");
                } else {
                    setTimeout(() => {
                        window.location.href = "https://wowgames.gr/playroom.html";
                    }, 1000);
                }

            } else {
                // opponent lost

                $("#board").css("display", "none");
                $("#whosturn").css("display", "none");
                $("#winner-message").css("display", "block");

                if (localStorage.sound == 'true') {
                    won.play();
                }
                $("#winner-message").html("YOU WON!");
                $(".final-messages").css("display", "flex");

                if (localStorage.type == "one") {
                    $("#win-buttons").css("display", "flex");
                } else {
                    setTimeout(() => {
                        // w=1 is the parameter to show that the player is the winner among the couple from the tournament
                        window.location.href = "https://wowgames.gr/playroom.html?w=1";
                    }, 1000);
                }

            }
        }

    }, 500);

    setTimeout(() => {
        // if array is full
        if (isFull(gridArr)) {
            //delete images from inside the squares

            squares.forEach((square) => {
                const img = square.querySelector('img');
                if (img) {
                    img.remove();
                }
                // put click listeners again
                square.addEventListener('click', iplayed);

            });

            // initialize array with 0s
            gridArr = [
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ];

            rotate();

        }
    }, 900);

}

// this function gets the ID of the move of the opponent and places it with the exact place-- in the same order as the function "iplayed" above

function theyplayed(id) {

    //01
    if (localStorage.sound == 'true') {
        turn.play();
    }
    var idString = "#" + id;
    var oppIdNow = $(idString);

    var firstDigitNum = Number(String(id)[0]);

    var lastDigitNum = Number(String(id).slice(-1));

    gridArr[firstDigitNum][lastDigitNum] = 2;

    const getElement = document.getElementById(id);

    $(idString).html(oppicon);
    getElement.removeEventListener("click", iplayed);

    rotate();

    setTimeout(() => {
        checkforlosernow = checkForLoser(gridArr);

        if (checkforlosernow != null) {

            if (checkforlosernow == 1) {

                $("#board").css("display", "none");
                $("#whosturn").css("display", "none");
                $("#winner-message").css("display", "block");
                if (localStorage.sound == 'true') {
                    lost.play();
                }
                $("#winner-message").html("YOU LOST!");
                $(".final-messages").css("display", "flex");

                // show "play again" or "new game" if this is a 1v1 game .. else go to playroom to continue the tournament
                if (localStorage.type == "one") {
                    $("#win-buttons").css("display", "flex");

                } else {
                    setTimeout(() => {
                        window.location.href = "https://wowgames.gr/playroom.html?rc=" + localStorage.room;
                    }, 1000);
                }

            } else {

                $("#board").css("display", "none");
                $("#whosturn").css("display", "none");
                $("#winner-message").css("display", "block");
                if (localStorage.sound == 'true') {
                    won.play();
                }
                $("#winner-message").html("YOU WON!");
                $(".final-messages").css("display", "flex");

                // show "play again" or "new game" if this is a 1v1 game .. else go to playroom to continue the tournament
                if (localStorage.type == "one") {
                    $("#win-buttons").css("display", "flex");
                } else {
                    setTimeout(() => {
                        // w=1 is the parameter to show that the player is the winner among the couple from the tournament
                        window.location.href = "https://wowgames.gr/playroom.html?w=1";
                    }, 1000);
                }

            }

        }

    }, 500);

    setTimeout(() => {

        if (isFull(gridArr)) {
            //delete images from inside the squares

            squares.forEach((square) => {
                const img = square.querySelector('img');
                if (img) {
                    img.remove();
                }
                // put click listeners again
                square.addEventListener('click', iplayed);
            });

            // initialize array with 0s
            gridArr = [
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ];

            rotate();

        }
    }, 900);

}

// checks and compares all number in a array to find same icons in the row/column/diagonal
// returns 0,1,2 based on WHO placed the icons
function checkForLoser(grid) {
    console.log(grid);
    const rows = grid.length;
    const cols = grid[0].length;

    // check rows
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j <= cols - 3; j++) {
            if (grid[i][j] !== 0 && grid[i][j] === grid[i][j + 1] && grid[i][j] === grid[i][j + 2]) {
                return grid[i][j];
            }
        }
    }

    // check columns
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j <= rows - 3; j++) {
            if (grid[j][i] !== 0 && grid[j][i] === grid[j + 1][i] && grid[j][i] === grid[j + 2][i]) {
                return grid[j][i];
            }
        }
    }

    // check diagonals
    for (let i = 0; i <= rows - 3; i++) {
        for (let j = 0; j <= cols - 3; j++) {
            if (grid[i][j] !== 0 && grid[i][j] === grid[i + 1][j + 1] && grid[i][j] === grid[i + 2][j + 2]) {
                return grid[i][j];
            }
            if (grid[i][j + 2] !== 0 && grid[i][j + 2] === grid[i + 1][j + 1] && grid[i][j + 2] === grid[i + 2][j]) {
                return grid[i][j + 2];
            }
        }
    }

    // no winner
    return null;
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
