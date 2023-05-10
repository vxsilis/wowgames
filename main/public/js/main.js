// connect to socket
const socket = io();

var playersArray = [];

// sound toggle

$("#audio_icon_off").click(function() {
    $("#audio_setting").prop("checked", false);

});

$("#audio_icon_on").click(function() {
    $("#audio_setting").prop("checked", true);

});

if (localStorage.sound == 'true') {
    $("#audio_setting").prop("checked", true);
} else {
    $("#audio_setting").prop("checked", false);
}

$("#audio_setting").click();

setTimeout(() => {
    $("#audio_setting").click();
}, 0);

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

// every time that user connects update his socket io in DB
socket.on('connect', () => {

    localStorage.socket = socket.id;
    if (localStorage.name) {

        socket.emit('updateUserSocket', localStorage.name, localStorage.socket);
    }

});

// im still online
socket.on('areUhere', () => {
    socket.emit('imHere', localStorage.name);

});

// get input name for room and request form server to check if it available
function checkRoom() {

    var roomname = document.getElementById('roomname').value;
    document.getElementById("createroombutton").innerHTML = 'wait...';
    socket.emit("checkRoomname", roomname);

}

// result if the room is available
socket.on('checkedRoom', (result, who) => {

    if (result != "") {
        document.getElementById("createroombutton").innerHTML = 'Unavailable name';
        console.log("ROOM ALREADY EXISTS");
    } else {
        console.log("CREATE ROOM ");
        var roomname = document.getElementById('roomname').value;
        // i belong to this room
        localStorage.room = roomname;
        // im the owner
        localStorage.owner = "yes";
        // actually create the room
        socket.emit("newRoom", roomname, localStorage.game, localStorage.name);
        // go to room
        window.location.href = "room.html";
    }

});

// when i join a room save it ot localstoage and emit to server 
function setRoom(roomname) {

    localStorage.room = roomname;
    socket.emit('setRoom', localStorage.name, roomname);

}

// get input name for username and request server to check if it is available
function checkUsername() {

    var usercheck = document.getElementById('username').value;
    socket.emit("checkUsername", usercheck, localStorage.socket);

}

// server checked if username is available
socket.on('checkedUser', (result) => {

    var username = document.getElementById('username').value;

    if (result != " ") {
        console.log("USER ALREADY EXISTS");
    }

    if (result != "") {
        document.getElementById("createuserbutton").innerHTML = 'unavailable name';
        setTimeout(() => {
            document.getElementById("createuserbutton").innerHTML = 'play now!';
        }, 3000);
        console.log("USER ALREADY EXISTS");
    } else {
        // if username is available actually create the user
        socket.emit("newUser", username, localStorage.socket);
        console.log("CREATE USER ", username, localStorage.socket);
        // go to next page
        window.location.href = "type.html";
    }

});

// i want to create a new user
function newUser() {

    var username = document.getElementById('username').value;

    var english = /^[A-Za-z0-9]*$/;
    // check for empty name
    if (username === "") {

        document.getElementById("createuserbutton").innerHTML = 'cant enter empty name';
        setTimeout(() => {
            document.getElementById("createuserbutton").innerHTML = 'play now!';
        }, 3000);

        // check for english only charachers
    } else if (english.test(username)) {
        document.getElementById("createuserbutton").innerHTML = 'wait...';
        // request server to check if usename is available
        socket.emit("checkUsername", username, localStorage.socket);
        localStorage.name = username;
        // it's not english
    } else {
        document.getElementById("createuserbutton").innerHTML = 'only A-Z & 1-9 chars';
        setTimeout(() => {
            document.getElementById("createuserbutton").innerHTML = 'play now!';
        }, 3000);
    }

}

// set and emit to server player's type preference
function setType(type) {

    socket.emit("setType", localStorage.name, type);
    localStorage.type = type;
    localStorage.room = "publi";

}

// set and emit to server  player's game preference
function setGame(game) {

    socket.emit("setGame", localStorage.name, game);
    localStorage.game = game;

}

// if im in these pages im not currently in game
if (document.URL.includes("/type.html") || document.URL.includes("/playroom.html")) {
    socket.emit("setInGame", localStorage.name);
}

// on game page replace the links of every game based on if u picked tourname or 1v1 in the previous page
if (document.URL.includes("game.html")) {

    var gamelink1 = document.getElementById("game-cardgame");
    var gamelink2 = document.getElementById("game-score4");
    var gamelink3 = document.getElementById("game-memory");

    if (localStorage.type == "one") {
        // print type in bottom status
        document.getElementById("type-of-game").innerHTML = "solo";

        gamelink1.setAttribute("href", "opponent.html");
        gamelink2.setAttribute("href", "opponent.html");
        gamelink3.setAttribute("href", "opponent.html");
    } else if (localStorage.type == "tour") {
        document.getElementById("type-of-game").innerHTML = "tournament";
        gamelink1.setAttribute("href", "joinroom.html");
        gamelink2.setAttribute("href", "joinroom.html");
        gamelink3.setAttribute("href", "joinroom.html");
    }

}

// if on any of the following pages update game,type, room name status on the bottom of the page
if (document.URL.includes("opponent.html") || document.URL.includes("joinroom.html") || document.URL.includes("/room.html") || document.URL.includes("/playroom.html")) {

    document.getElementById("what-game").innerHTML = localStorage.game;

    if (localStorage.game == "dont") {
        document.getElementById("what-game").innerHTML = "Don't Do it";
    } else if (localStorage.game == "four") {
        document.getElementById("what-game").innerHTML = "Four on the Row";
    } else {
        document.getElementById("what-game").innerHTML = "Mind Play";
    }

    if (document.URL.includes("/room.html") || document.URL.includes("/playroom.html")) {

        $('.what-room').html(localStorage.room);
    }

}

// RENDER ALL PLAYERS THAT PLAY THIS GAME IN THIS ROOM  -- every 3 seconds

if ((document.URL.includes("opponent.html")) || (document.URL.includes("/room.html"))) {

    function refreshOpps() {
        refreshPlayers(localStorage.game, localStorage.room, localStorage.type);
        setTimeout(refreshOpps, 3000);
    }

    refreshOpps();

}

function refreshPlayers(game, room, type) {
    // request from server to get room players
    socket.emit("giveMePlayers", game, room, type);

}

// we have the players from server
socket.on('takePlayers', result => {

    playersArray = [];

    //clear previous list of players by empty the content of html element

    if ($('#available-players-user').length) {
        document.getElementById("available-players-user").innerHTML = '';

    }

    // update number of players
    $("#numPlayers").html(result.length + "/6");

    // for everyplayer create and print him between html tag
    for (var i = 0; i < result.length; i++) {

        playersArray.unshift(result[i].name);

        if ((result[i].name != localStorage.name) && (document.URL.includes("opponent.html"))) {
            $('#available-players-user').append('<div class="available-user">' + result[i].name + '</div>');
        } else if (document.URL.includes("/room.html")) {
            $('#available-players-user').append('<div class="available-user">' + result[i].name + '</div>');

        }

    }

});

if (document.URL.includes("opponent.html")) {
    $('#rules-content').css("color", "inherit");
}

// rules content updated based of localstorage

if ((document.URL.includes("opponent.html")) || (document.URL.includes("/room.html"))) {

    if (localStorage.game == "dont") {
        document.getElementById("rules-content").innerHTML = `
    ● every player has their own icon and play in turn<br>
    ● place your own wherever you want but DONT place three same icons horizontally, vertically or diagonally<br>
    ● the player that places three of their icon on the row LOSES!`;

    } else if (localStorage.game == "four") {
        document.getElementById("rules-content").innerHTML = `
    ● every player has their color of piece and play in turn<br>
    ● choose the column you want to position your piece<br>
    ● they piece falls in the lower open place<br>
    ● place FOUR of-your-colour pieces in the row horizontally, vertically or diagonally to WIN<br>`;

    } else if (localStorage.game == "memory") {
        document.getElementById("rules-content").innerHTML = `
    ● guess and try to find the pair of cards that has the same icon<br>
    ● players play in turn<br>
    ● REMEMBER what cards your opponent flipped...<br>
    ● the one with the higher score wins!<br>`;

    }

}

// refresh counter of players
function fnCount() {

    if (!(document.URL.includes("/room.html"))) {
        socket.emit("countplayers", "publi");
    }

    setTimeout(fnCount, 4000);
}

fnCount();

// we have the number of players
socket.on('countplayers', playersonline => {

    if ((document.URL.includes("/room.html"))) {

    } else {
        $("#players-online").html(playersonline);
    }

});

// RENDER ALL ROOMS THAT are available for this game

if (document.URL.includes("joinroom.html")) {

    function yourSecFunction() {
        console.log("refresh the list with the available-rooms-list");
        refreshRooms(localStorage.game);

        setTimeout(yourSecFunction, 3000);
    }

    yourSecFunction();

}

// request from server rooms for specific game
function refreshRooms(game) {
    console.log("refresh ROOM list");
    socket.emit("giveMeRooms", game);
}

// we have the available rooms from server
socket.on('takeRooms', (result) => {

    //clear previous list of rooms by empty the content of html element

    if ($('#available-rooms-list').length) {
        document.getElementById("available-rooms-list").innerHTML = '';
        console.log("clean");
    }

    // loop through the results array and print the as html element
    for (var i = 0; i < result.length; i++) {
        if ((result[i].game == localStorage.game) && (result[i].name !== localStorage.kicked)) {
            $('#available-rooms-list').append('<div class="available-room">' + result[i].name + '</div>');
        }
    }

});

// if im the owner i can see the "start tournament button"
if ((document.URL.includes("/room.html")) || (document.URL.includes("/playroom.html"))) {
    if (localStorage.owner == "yes") {
        document.getElementById("start-game").style.display = "block";
        document.getElementById("wait-game").style.display = "none";
    } else {
        document.getElementById("wait-game").style.display = "block";
        document.getElementById("start-game").style.display = "none";

    }
}

// im accepted to room. save room to localstorage and redirect
socket.on('imaccepted', (opponent, room) => {

    if (opponent == localStorage.name) {
        localStorage.room = room;
        window.location.href = "room.html";

    }

});

// owner clicks on start tourname
$(document).on('click', '#start-game', function(e) {

    if (document.URL.includes("/playroom.html")) { // we are on the lobby after the first round

        if (cantourstart == 1) {
            socket.emit("startTour", localStorage.room, winnerplayers);
        }

    } else { // we are on the pregame room

        var playerNum = playersArray.length;
        // can start if there arent enough peolpe
        if (playerNum >= 3) {

            socket.emit("startTour", localStorage.room, playersArray);
        }

    }

});

// tournament starts
socket.on("startTour", (results, roomCodes) => {

    // in case i was watching a video hide the overlay
    $(".youtube-video").css("display", "none");
    $('#theVideo').html('');

    $("#results").append(results);
    if (localStorage.sound == 'true') {
        turn.play();
    }

    // ready to play overlay
    $(".readyToPlay").css("display", "flex");

    var rc;
    rc = "none";

    // loop throught results and find my name - then look on the third column to get the room code i will go to
    for (var i = 0; i < roomCodes.length; i++) {
        for (var j = 0; j < roomCodes[i].length; j++) {
            if (roomCodes[i][j].search(localStorage.name) != -1) {
                rc = roomCodes[i][2];
                break;
            }
        }
    }

    setTimeout(() => {
        if ((rc != "alone") && (rc != "none")) {
            // redirect to game 

            var redirect = "https://" + localStorage.game + ".wowgames.gr?rc=" + rc + "&r=1";

            window.location.href = redirect;
        } else { // you dont play on the next round so you stay in the lobby

            var redirect = "/playroom.html?rc=" + localStorage.room;
            window.location.href = redirect;
        }

    }, 5000);

});

// i was kicked out of a room
socket.on('kicked', (name, room) => {

    if (name == localStorage.name) {

        localStorage.kicked = room;
        // flag variable to display kicked message
        localStorage.displayKickedMes = 1;
        // redirect
        window.location.href = "type.html";

    }

});

// display kicked message
if ((document.URL.includes("/joinroom.html")) && (localStorage.displayKickedMes == 1)) {

    $("#kick-roomname").html(localStorage.kicked);
    $(".incoming-kicked").css("display", "block");

    setTimeout(() => {
        $(".incoming-kicked").css("display", "none");

    }, 3000);

    localStorage.displayKickedMes = 0;

}

// in case the room owner disconnects the tour will stop and room will be deleted
// this functionality hasnt been developed yet

// socket.on('ownerDisconnected', () => {

//     $('.flex-center').html('<div class="waiting-message"> owner has been disconnected...</div>');
//     setTimeout(() => {
//         window.location.href = "https://wowgames.gr/joinroom.html";

//     }, 3000);

// });

// prevent events from pressing the "enter" button
window.addEventListener('keydown', function(e) {
    if (e.keyIdentifier == 'U+000A' || e.keyIdentifier == 'Enter' || e.keyCode == 13) {
        if (e.target.nodeName == 'INPUT' && e.target.type == 'text') {
            e.preventDefault();
            return false;
        }
    }
}, true);

if (document.URL.includes("/playroom.html")) {
    var cantourstart = 1;
    var winnerplayers = [];

    // get URL parameters
    const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    });

    // if this parametere is declared and equal to 1 it means i was the winner of the game i just came back from
    var didiwon = params.w;

    if (didiwon == 1) {
        // let server know i was the winner
        socket.emit("imWinner", localStorage.name, localStorage.room);
    }

    // if there is no localstorage room name redirect to homepage
    if (localStorage.room == null) {

        $('.waiting-message').html("looks like you shouldn't be here.. you will be redirected to homepage");

        setTimeout(function() {
            window.location.href = "https://wowgames.gr/type.html";
        }, 3000);
    }

    // join room of tournament you take place
    socket.emit("joinRoom", localStorage.name, localStorage.room);

    if (didiwon != 1) {
        // get current winners/status of room
        socket.emit("getRoomWinners", localStorage.room);

    }

}

// we have current winners and who is playing from server
socket.on('roomWinners', (results) => {

    console.log("got room winners= ", results);

    $('.winnerresults').html(results);

    // clear content of html to print new results
    $('#available-players-user').html('');

    // on the results, find every string inside of the parentheses
    let regex = /\((.*?)\)/g;
    let match;

    while ((match = regex.exec(results))) {
        // if its none of the above it means we have a winner among a couple
        if ((match[1] != "playing now")) {

            if (match[1] == "alone") {

                // get the player name before the parentheses 
                var regex2 = /<\/br>(.*?)<span>\(alone\)<\/span>/;
                var match2 = results.match(regex2);

                let alonestring = match2 ? match2[1].trim() : null;

                // append to div with qualifiers
                $('#available-players-user').append('<div class="available-user">' + alonestring + '</div>');

                // push it to the winners array for theplayroom
                winnerplayers.push(alonestring);
            } else {

                // append to div with qualifiers
                $('#available-players-user').append('<div class="available-user">' + match[1] + '</div>');

                // push it to the winners array for theplayroom
                winnerplayers.push(match[1]);

            }
        } else {
            console.log("cant start ____________");
            // if there are still couples that play the tour can NOT start
            cantourstart = 0;
        }

    }

    // if there is only player in the array it means he is the winner. emit it to server
    if (cantourstart == 1 && winnerplayers.length == 1) {

        socket.emit("finalWinner", winnerplayers, localStorage.room);

        socket.emit("deleteRoom", localStorage.room);

    }

});

// display tournament winner and redirect to homepage
socket.on('finalWinner', (winner) => {

    $('.flex-center').css("display", "none");

    $('#finalWinnerid').html(winner);
    $('.finalWinner').css("display", "block");

    setTimeout(() => {
        window.location.href = "https://wowgames.gr/type.html";

    }, 4000);

});

// YOUTUBE VIDEO LINKS

var ytvideos = [
    'BFLP9XzFrq0', // tyler
    'x52FEo0I0ig', //jas
    'rhrqbcufZXo', // louis
    'yERSIve7zKI', // kafes
    'zg_QcA-IbaQ', //dog
    '-kASyWd1k9Y', //wallows
    '5_UnGyI9G7w', //gabi belle
    'nzUA0SK8CV4', // asmr
    'pRpvdcjkT3k', // cat
    'BNSp_DFr5f0', //cats
    'dQw4w9WgXcQ', //rick roll
    'EOmmx4ycYiA' // village sounds
];

//open the video window
$(document).on('click', '#watch-video', function() {

    $(".youtube-video").css("display", "flex");
    playVideo();
});

// close the video window
$(document).on('click', '#closeVideo', function() {

    $(".youtube-video").css("display", "none");
    $('#theVideo').html('');

});

$(document).on('click', '#anotherVideo', function(e) {
    playVideo();

});

//play a random video
function playVideo() {

    var index = Math.floor(Math.random() * ytvideos.length);
    var html = '<iframe width="" height="480"   src="https://www.youtube.com/embed/' + ytvideos[index] + '?autoplay=1" frameborder="0" allowfullscreen></iframe>';

    $('#theVideo').html(html);

}

// share button

$(".share-button").click(
    function(e) {
        e.preventDefault();
        //var link = $(this).find("a");
        window.open($(this).attr("href"), '_blank', 'height=600,width=600');
        return false;
    }
);

$(".share-button").click(function() {
    console.log("bruh");

    // create the clipboard text based on player's status
    var invtext = "Hey! Let's play together at Wow Games. My username is @" + localStorage.name;

    if (localStorage.type == "one") {
        invtext += " Find me on 1 VS 1 ";
        if (localStorage.game != null) {
            if (localStorage.game == "card") {
                invtext += "playing 'Don't Do It'";
            } else if (localStorage.game == "score") {
                invtext += "playing 4 on the Row";
            } else {
                invtext += "playing Mind Play";
            }
        }
    } else if (localStorage.type == "tour") {
        invtext += " Find me on tournament ";
        if (localStorage.game != null) {
            if (localStorage.game == "card") {
                invtext += "playing 'Don't Do It'";
            } else if (localStorage.game == "score") {
                invtext += "playing 4 on the Row";
            } else {
                invtext += "playing Mind Play";
            }
        }

        if (localStorage.room != null) {
            invtext += "on the room " + localStorage.room;
        }

    }
    // copy it to player's clipboard
    navigator.clipboard.writeText(invtext);

});