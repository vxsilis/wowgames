// make socket connection
const socket = io();

var turn, winner, move, color;

// random generated name -- it doesnt really matter and has any connection with the REAL player's name. it is just for the server to understand the two players
var myname = (Math.random() + 1).toString(36).substring(7);


// get URL PARAMETERS
const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});

// am i part of a tournament or 1v1? 1=tour , 0=1v1

if (params.r == 1) {

    localStorage.type = "tour";
} else {
    localStorage.type = "one";
}

// current game room code 
let rc = params.rc;
if (rc == null) {// if there is no code passed as parameter go to homepage
    $('.waiting-message').html("looks like you shouldn't be here.. you will be redirected to homepage");

    setTimeout(function() {
        window.location.href = "https://wowgames.gr/type.html";
    }, 3000);
}
//join room
socket.emit("joinRoom", rc);
//get number of players in this room
socket.emit("getNumPlayers", rc, myname);
// got the number of players from server
socket.on("gotNumPlayers", function(numPlayers) {
    
// both players are here-- lets start
    if (numPlayers == 2) {

        socket.emit("gameInitialize", rc);


    } else if (numPlayers > 2) { // two players are here and already playing... this is awkward
        $('.waiting-message').html('this room is full.. you will be redirected to the homepage');

        setTimeout(function() {
            window.location.href = "https://wowgames.gr/type.html";
        }, 3000);
    }

})
// when game starts
socket.on("gameInitialized", () => {
// delete waiting message and display board
    $(".waiting-message").css("display", "none");
    $(".connectfour-container").css("display", "block");


})


// turn = is who just played!
socket.on("gameState", function(turn, winner, move) {

    turn = turn;
    winner = winner;
    move = move;

// if there is no winner
    if (winner == "none") {


        if (turn == myname) { // this means i just played so disable mouse clicks

            $(".connectfour-container").css("pointer-events", "none");

            $("#whosturn").html("not your turn...");

        } else {    // it my turn 

        // the move will be equal to "none" ONLY on initialization of the game that none played yet 

            if (move != "none") {
                //  call the function that plays the opponents move
                theyplayed(move);
            }
// enable mouse clicks
            $(".connectfour-container").css("pointer-events", "auto");
// print color of player incase they forget
            $("#whosturn").html("it's your turn...red!");

        }

// if there is winner
    } else if (winner == myname) {

        $(".connectfour-container").css("display", "none");
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
                window.location.href = "https://wowgames.gr/playroom.html?w=1";
            }, 1000);
        }

    } else {

        $(".connectfour-container").css("display", "none");
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
                window.location.href = "https://wowgames.gr/playroom.html";
            }, 1000);
        }

    }

})

// emit to server the move i made. 
function iplayed(move) {
				// name, winner, move, roomcode
    socket.emit("gameState", myname, "none", move, rc);

}

function winner(move) {
    socket.emit("gameState", myname, myname, move, rc);

}


// if i press the new game button i go to homepage
$('#play-new-game').click(function() {

    window.location.href = "https://wowgames.gr/type.html";

});

// send invitation for play again 1v1
$('#play-again').click(function() {

    socket.emit("wannaPlayAgain", rc);
    $('#play-again').html('<span>waiting...</span>');

    // if there is no response in 10 seconds redirect to homepage
    setTimeout(() => {
        $('#play-again').html('<span>no answer :-(</span>');
    }, 10000);

    setTimeout(() => {
        window.location.href = "https://wowgames.gr/type.html";
    }, 12000);

});

// opponent wants to play again. display the invitation
socket.on("wannaPlayAgain", function() {

    $(".incoming-inv").css("display", "block");

});


// i want to accept the invitaion and playgame
$('.incoming-yes').click(function() {

    var newroomcode = (Math.random() + 1).toString(36).substring(7);

    socket.emit("playagaincode", rc, newroomcode);

});


// i decline the incoming invitation and i go to homepage
$('.incoming-no').click(function() {

    socket.emit("declinePlayAgain", rc);
    window.location.href = "https://wowgames.gr/type.html";

});

//opponent declined invitation to play again so redirect to homepage
socket.on("declinePlayAgain", function() {

    $('#play-again').html('declined :-(');
    setTimeout(() => {
        window.location.href = "https://wowgames.gr/type.html";
    }, 2000);

});

// the new room code i get from the opponentn
socket.on("playagaincode", function(newroomcode) {

    window.location.href = "https://four.wowgames.gr?rc=" + newroomcode;

});


// when opponent disconnects
socket.on("disconnected", function() {

    $(".waiting-message").css("display", "block");
    $(".waiting-message").html("opponent disconnected.. you will be redicted..");
    $(".connectfour-container").css("display", "none");


// based of the type of game redirect ot correct page
    if (localStorage.type == "one") {

        setTimeout(() => {
            window.location.href = "https://wowgames.gr/type.html";
        }, 3000);
    } else {

        setTimeout(() => {
        	// w=1 is the parameter to show that the player is the winner among the couple from the tournament
            window.location.href = "https://wowgames.gr/playroom.html?w=1";
        }, 3000);
    }

});