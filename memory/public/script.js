// make socket connection
const socket = io();

var turn, winner, move, scoreone, scoretwo;

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

    // display board and score
    $(".score").css("display", "block");
    $(".wrapper").css("display", "block");
})



// turn = is who just played!
// score1/playerone is the first player that connected to the game
socket.on("gameState", function(turn, winner, move, score1, score2) {
    scoreone = score1;
    scoretwo = score2;

    // print each players score
    $("#playeronescore").html(scoreone);
    $("#playertwoscore").html(scoretwo);
    sendTurn(turn); // save whos turn is for the game.js 


// the move will be equal to "none" ONLY on initialization of the game that none played yet 
    if ((move == "none") && (turn == myname)) {
        // i was the first one to connect so im playerone , score1
        localStorage.scorenum = "#playeronescore";
        $("#playeronename").html('me');
        $("#playertwoname").html('opponent');
        
    } else if ((move == "none") && (turn != myname)) {
        
        localStorage.scorenum = "#playertwoscore";
        $("#playertwoname").html('me');
        $("#playeronename").html('opponent');
     
    }



    if (winner == "none") {


        if (turn == myname) {
            // this means that i just played. so turn of pointer clicks
            $(".wrapper").css("pointer-events", "none");
            $("#whosturn").html("not your turn...");
        } else {
            // it my turn 
            // adding some delay to give time for the flipping card animation to complete before any card is clickable
            setTimeout(() => {
                $(".wrapper").css("pointer-events", "auto");
                $("#whosturn").html("it's your turn!");
            }, 2000);
        }

// if there is winner , we compare it with player's name (playerone or playertwo)
    } else if ((winner == "p1") && (localStorage.scorenum == "#playeronescore")) {
        
        // hide game board and score
        $(".wrapper").css("display", "none");
        $(".score").css("display", "none");
        $("#whosturn").css("display", "none");

        // display winner message
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
            }, 3000);
        }

        // THESE IFs repeat for all the possible equations
    } else if ((winner == "p1") && (localStorage.scorenum == "#playertwoscore")) {
        $(".wrapper").css("display", "none");
        $(".score").css("display", "none");
        $("#whosturn").css("display", "none");
        $("#winner-message").css("display", "block");


        if (localStorage.sound == 'true') {
            lost.play();
        }
        $("#winner-message").html("YOU LOST!");
        $(".final-messages").css("display", "flex");



        if (localStorage.type == "one") {
            $("#win-buttons").css("display", "flex");
        } else {
            setTimeout(() => {
                window.location.href = "https://wowgames.gr/playroom.html";
            }, 3000);
        }
    } else if ((winner == "p2") && (localStorage.scorenum == "#playertwoscore")) {
        $(".wrapper").css("display", "none");
        $(".score").css("display", "none");
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
            // $("#win-redirect").css("display", "block");
            setTimeout(() => {
                // w=1 is the parameter to show that the player is the winner among the couple from the tournament
                window.location.href = "https://wowgames.gr/playroom.html?w=1";
            }, 3000);
        }
    } else if ((winner == "p2") && (localStorage.scorenum == "#playeronescore")) {
        $(".wrapper").css("display", "none");
        $(".score").css("display", "none");
        $("#whosturn").css("display", "none");
        $("#winner-message").css("display", "block");


        if (localStorage.sound == 'true') {
            lost.play();
        }
        $("#winner-message").html("YOU LOST!");
        $(".final-messages").css("display", "flex");


        if (localStorage.type == "one") {
            $("#win-buttons").css("display", "flex");
        } else {
            // $("#win-redirect").css("display", "block");
            setTimeout(() => {
                window.location.href = "https://wowgames.gr/playroom.html";
            }, 3000);
        }
    }
})




// this function is called when the player flips the first card and emits it to the opponent
function iflipped(move) {
    socket.emit("iflipped", move, rc);
}


// opponent flipped a card 
socket.on("theyflipped", function(move) {
    // flip the opponent's card
    flipOpp(move); 
    if (localStorage.sound == 'true') {
        turn.play();
    }
});

// in case of draw request shuffle cards from the server
function isopalia() {
    socket.emit("shuffleCard", rc);
}


// server shuffled the cards
socket.on("gotCards", function(arr) {
    matched = 0;
    disableDeck = false;
    cardOne = cardTwo = "";

    // get this array and for every div that is a card add as a img src the correct name file 
    cards.forEach((card, i) => {
        card.classList.remove("flip"); //so they icon is hidden
        let imgTag = card.querySelector(".back-view img");
        imgTag.src = `images/img_${arr[i]}.png`;
        // card.addEventListener("click", flipCard);
        $( card ).on( "click", flipCard );
    });
});


// im winner. parameters the winning move and my name
function winner(movenow, who) {
// based on if im playerone or two emit the corresponding score
    if (localStorage.scorenum == "#playeronescore") {
        socket.emit("gameState", myname, who, movenow, myscore, scoretwo, rc);
    } else {
        socket.emit("gameState", myname, who, movenow, scoreone, myscore, rc);
    }
}

// function called when i played BOTH of my cards . and now the turn is changing
function changeTurn(movenow, myscore) {
    $(".wrapper").css("pointer-events", "none");
    $("#whosturn").html("not your turn...");

    if (localStorage.scorenum == "#playeronescore") {
        socket.emit("gameState", myname, "none", movenow, myscore, scoretwo, rc);
    } else {
        socket.emit("gameState", myname, "none", movenow, scoreone, myscore, rc);
    }
}




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
    console.log("he is calling");
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
    window.location.href = "https://memory.wowgames.gr?rc=" + newroomcode;
});

// when opponent disconnects
socket.on("disconnected", function() {
    $(".waiting-message").css("display", "block");
    $(".final-messages").css("display", "none");
    $(".waiting-message").html("opponent disconnected.. you will be redicted..");
    $(".score").css("display", "none");
    $(".wrapper").css("display", "none");
    $("#whosturn").css("display", "none");

    // based of the type of game redirect ot correct page
    if (localStorage.type == "one") {
        setTimeout(() => {
            window.location.href = "https://wowgames.gr/type.html";
        }, 2000);
    } else {
        setTimeout(() => {
            // w=1 is the parameter to show that the player is the winner among the couple from the tournament
            window.location.href = "https://wowgames.gr/playroom.html?w=1";
        }, 2000);
    }
});