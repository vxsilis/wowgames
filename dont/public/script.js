var turn, move;

// make socket connection
const socket = io();

// random generated name -- it doesnt really matter and has any connection with the REAL player's name. it is just for the server to understand the two players
var myname = (Math.random() + 1).toString(36).substring(7);

// get URL PARAMETERS
const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});

// am i part of a tournament or 1v1? 1=tour , not declared=1v1

if (params.r == 1) {

    localStorage.type = "tour";
} else {
    localStorage.type = "one";
}

// current game room code 
let rc = params.rc;
if (rc == null) { // if there is no code passed as parameter go to homepage
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

        // two players are here and already playing... this is awkward
    } else if (numPlayers > 2) {
        $('.waiting-message').html('this room is full.. you will be redirected to the homepage');

        // redirect to homepage
        setTimeout(function() {
            window.location.href = "https://wowgames.gr/type.html";
        }, 3000);
    }
})

// when game starts
socket.on("gameInitialized", () => {

    // delete waiting message
    $(".waiting-message").css("display", "none");

    // display board 
    $("#board").css("display", "flex");

})

// turn = is who just played!
socket.on("gameState", function(turn, move) {

    turn = turn;

    move = move;

    if (turn == myname) {
        // this means that i just played. so turn of pointer clicks

        $('#board').css('pointer-events', 'none');

        $("#whosturn").html("not your turn...");

    } else {
        // it my turn 

        // the move will be equal to "none" ONLY on initialization of the game that none played yet 
        if (move != "none") {
            //  call the function that plays the opponents move
            theyplayed(move);
        }
        // enable mouse clicks
        $('#board').css('pointer-events', 'auto');

        // print the icon of the player in case they forget
        $("#whosturn").html("it's your turn..." + player1[randomIndex] + "!");

    }

})

function iPlayedToServer(move) {
    // emit to server the move i made
    socket.emit("gameState", myname, move, rc);

}

// if i press the new game button i go to homepage
$('#play-new-game').click(function() {

    window.location.href = "https://wowgames.gr/type.html";

});

// send invitation to play again 
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

    //generate the new room code we will both be redirected to
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

    window.location.href = "https://dont.wowgames.gr?rc=" + newroomcode;

});

// when opponent disconnects
socket.on("disconnected", function() {


    $(".waiting-message").css("display", "block");
    $(".final-messages").css("display", "none");
    $(".waiting-message").html("opponent disconnected.. you will be redicted..");
    $("#whosturn").css("display", "none");
    $("#board").css("display", "none");

    // based of the type of game redirect ot correct page
    if (localStorage.type == "one") {

        setTimeout(() => {
            window.location.href = "https://wowgames.gr/type.html";
        }, 2000);
    } else {

// w=1 is the parameter to show that the player is the winner among the couple from the tournament
        setTimeout(() => {
            window.location.href = "https://wowgames.gr/playroom.html?w=1";
        }, 2000);
    }

});