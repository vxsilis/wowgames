// counters for every column. counts how many pieces have been placed
var val_c1 = 1;
var val_c2 = 1;
var val_c3 = 1;
var val_c4 = 1;
var val_c5 = 1;
var val_c6 = 1;
var val_c7 = 1;


// load sound files
var lost = new Audio('sounds/lost.mp3');
var won = new Audio('sounds/won.mp3');
var played = new Audio('sounds/played.mp3');
var turn = new Audio('sounds/turn.mp3');


// set colors for every players
var mycolor = 'rgb(235, 123, 109)';
var oopcolor = 'rgb(103, 141, 125)';



//checking the winner
function check(player, move) {
    setTimeout(() => {
        // check for same colour pieces in the same row
        for (i = 1; i <= 7; i++) {
            for (j = 1; j <= 3; j++) {
                if (document.getElementById(`c${i}r${j}`).style.backgroundColor == `${player}` && document.getElementById(`c${i}r${j + 1}`).style.backgroundColor == `${player}` && document.getElementById(`c${i}r${j + 2}`).style.backgroundColor == `${player}` && document.getElementById(`c${i}r${j + 3}`).style.backgroundColor == `${player}`) {
                    winner(move);
                }
            }
        }
        // check for same colour pieces in the same column
        for (i = 1; i <= 6; i++) {
            for (j = 1; j <= 4; j++) {
                if (document.getElementById(`c${j}r${i}`).style.backgroundColor == `${player}` && document.getElementById(`c${j + 1}r${i}`).style.backgroundColor == `${player}` && document.getElementById(`c${j + 2}r${i}`).style.backgroundColor == `${player}` && document.getElementById(`c${j + 3}r${i}`).style.backgroundColor == `${player}`) {
                    winner(move);
                }
            }
        }
        // check for same colour pieces in the diagonal in one direction
        for (i = 1; i <= 4; i++) {
            for (j = 1; j <= 3; j++) {
                if (document.getElementById(`c${i}r${j}`).style.backgroundColor == `${player}` && document.getElementById(`c${i + 1}r${j + 1}`).style.backgroundColor == `${player}` && document.getElementById(`c${i + 2}r${j + 2}`).style.backgroundColor == `${player}` && document.getElementById(`c${i + 3}r${j + 3}`).style.backgroundColor == `${player}`) {
                    winner(move);
                }
            }
        }
        // check for same colour pieces in the diagonal in the other direction
        for (i = 1; i <= 4; i++) {
            for (j = 6; j >= 4; j--) {
                if (document.getElementById(`c${i}r${j}`).style.backgroundColor == `${player}` && document.getElementById(`c${i + 1}r${j - 1}`).style.backgroundColor == `${player}` && document.getElementById(`c${i + 2}r${j - 2}`).style.backgroundColor == `${player}` && document.getElementById(`c${i + 3}r${j - 3}`).style.backgroundColor == `${player}`) {
                    winner(move);
                }
            }
        }
    }, 200)
}


// for every coolumn add click listener 
document.querySelectorAll(".column").forEach((e) => {
    e.addEventListener("click", () => {
        if (localStorage.sound == 'true') {
            played.play();
        }
        // get this columns sum and increase it by one because a new piece will be placed
        sum = eval(`val_${e.id}`)
        eval(`val_${e.id}++`)
        // if the column is not full actually place the piece
        if (sum <= 6) {
            // paint this div the player color
            document.getElementById(`${e.id}r${sum}`).style.backgroundColor = mycolor;
            // check for winner
            check(mycolor, `${e.id}`);
            // call function to emit the move to server
            iplayed(`${e.id}`);
            // check if the whole table is full
            isFull();
        }
    })
})


// oppontn made a move
function theyplayed(move) {
    // increases the sum and paints the div the right color
    sum = eval(`val_${move}`);
    eval(`val_${move}++`);
    document.getElementById(`${move}r${sum}`).style.backgroundColor = oopcolor;
    if (localStorage.sound == 'true') {
        turn.play();
    }
    // check if the whole table is full
    isFull();
}


// check if the whole table is full -- basically if there are any white divs
function isFull() {
    let hasWhite = false;
    for (let i = 1; i <= 7; i++) {
        for (let j = 1; j <= 6; j++) {
            if ($("#" + `c${i}r${j}`).css("background-color") == "rgb(255, 255, 255)") {
                hasWhite = true;
                break;
            }
        }
        if (hasWhite) {
            break;
        }
    }
    if (!hasWhite) {
        //initializing every column's sum & make every square white
        val_c1 = 1;
        val_c2 = 1;
        val_c3 = 1;
        val_c4 = 1;
        val_c5 = 1;
        val_c6 = 1;
        val_c7 = 1;
        sum = 1;
        for (let i = 1; i <= 7; i++) {
            for (let j = 1; j <= 6; j++) {
                $("#" + `c${i}r${j}`).css("background-color", "rgb(255, 255, 255)");
            }
        }
    }
}



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