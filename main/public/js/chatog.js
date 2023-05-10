// load sound files
var incoming = new Audio('sounds/incoming.mp3');
var inbox = new Audio('sounds/message.mp3');
var turn = new Audio('sounds/turn.mp3');

// print name on screen
document.getElementById("my-name").innerHTML = '@' + localStorage.name;


//  join in general chat (public room)
if (!document.URL.includes("/room.html")) {
    socket.emit("joinRoom", localStorage.name, "public");

} else {
    socket.emit("joinRoom", localStorage.name, localStorage.room);
}


const chatForm = document.getElementById('send-container');
var messageBody = document.getElementById('all-messages');


// got message from server
socket.on('message', message => {
    outputMessage(message);
    //scroll to bottom
    messageBody.scrollTop = messageBody.scrollHeight;
});


// message submit from chat window
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    //get message text from form input
    const msg = e.target.elements.messageinput.value;

    // emit a message to the server
    socket.emit('chatMessage', msg);

    // Clear input
    msg.value = '';
    e.target.elements.messageinput.value = '';
    e.target.elements.messageinput.focus();

});


// output message to window
function outputMessage(message) {

    if ((localStorage.sound == 'true') && (localStorage.name != message.username)) {
        // play sound of message
        inbox.play();
    }

// start appending the information with specific classes for styles
    const div = document.createElement('div');
    div.classList.add('message-container');
    div.setAttribute('id', 'message-container');

    const spantime = document.createElement('span');
    spantime.classList.add('chat-time');
    spantime.innerText = moment().format('H:mm')
    div.appendChild(spantime);

    const spanuser = document.createElement('span');
    spanuser.classList.add('chat-user');
    spanuser.innerText = " " + message.username + " ";
    div.appendChild(spanuser);

    const spanmessage = document.createElement('span');
    spanmessage.classList.add('chat-message');
    spanmessage.innerText = message.text;
    div.appendChild(spanmessage);

// append the whole div
    document.querySelector('.all-messages').appendChild(div);
}


// animate different images on games thumbnails
$(".box").on({
    mouseover: function() {
        $(this).find("img:nth-child(1)").stop().animate({
            opacity: 0
        }, 200);
        $(this).find("img:nth-child(2)").stop().animate({
            opacity: 1
        }, 200);
    },
    mouseout: function() {
        $(this).find("img:nth-child(1)").stop().animate({
            opacity: 1
        }, 200);
        $(this).find("img:nth-child(2)").stop().animate({
            opacity: 0
        }, 200);
    }
});



const chatwindow = document.getElementById('chat-window');

document.getElementById("chat").addEventListener("click", function() {
// "yes" class = chat window is visible
    chatwindow.classList.toggle("yes");

});



// invitations

var incomingplayer, opponent;

// when you click on oppponent's name get height of div and display next to it the invitation box

$(document).on('click', '.available-user', function(e) {
    if ((document.URL.includes("opponent.html")) || (document.URL.includes("/room.html") && localStorage.owner == "yes")) {
        $("div.invite").css("display", "grid");
        opponent = $(this).text();
        document.getElementById("invite-user").innerHTML = opponent;
        var y = e.clientY;
        $("div.invite").css("top", y - 195);
        $(".invite-yes").html("YES");
        $(".invite-no").css("display", "block");
        $(".invite-room").css("grid-template-areas", 'title title" "yes no"');

    }
});

// the same but for when you click a room to join
$(document).on('click', '.available-room', function(e) {
    $("div.invite-room").css("display", "grid");
    opponent = $(this).text();
    document.getElementById("enter-room").innerHTML = opponent;
    var y = e.clientY;
    $("div.invite-room").css("top", y - 195);
    document.getElementById("invite-yes").innerHTML = "YES";
    $(".invite-no").css("display", "block");
    $(".invite-room").css("grid-template-areas", 'title title" "yes no"');
});


// SEND INVITE
$(document).on('click', '.invite-yes', function() {


// hide yes-no buttons and display "waiting" for the reply
    document.getElementById("invite-yes").innerHTML = "WAITING...";
    $(".invite-yes").css("pointer-events", "none");

    $(".invite-no").css("display", "none");
    $(".invite-room").css("grid-template-areas", 'title title" "yes yes"');

    if (document.URL.includes("opponent.html")) {
// emit to server
        socket.emit("invite", localStorage.name, opponent);

      

    } else if (document.URL.includes("joinroom.html")) {
// send invitation to join room
        socket.emit("join", localStorage.name, opponent);

        

    }
// if i dont get response within 8seconds print "no answer"
    setTimeout(() => {

        document.getElementById("invite-yes").innerHTML = "no answer:(";

        setTimeout(() => {
            $(".invite-room").css("display", "none");
            $(".invite").css("display", "none");
            $(".invite-yes").css("pointer-events", "auto");
        }, 2000);

    }, 8000);

});

// cancel invitation -- just closes the window
$(document).on('click', '.invite-no', function() {
    $("div.invite").css("display", "none");
    $("div.invite-room").css("display", "none");
});


// im receiving an request from someone who wants to join my room
socket.on('incomingjoin', (from, to) => {

    opponent = from;

// displays only if im the owner of the room
    if ((to == localStorage.name) && (localStorage.owner == "yes") && (document.URL.includes("/room.html"))) {

        $(".incoming-inv").css("display", "block");
        // display the name of the player who send the request
        document.getElementById("incoming-name").innerHTML = from;
        if (localStorage.sound == 'true') {
            incoming.play();
        }
        setTimeout(() => {
          // if i dont respond hide the invitation
            $(".incoming-inv").css("display", "none");
        }, 7000);
    }

});

// receiving invitation for 1v1
socket.on('incoming', (from, to) => {

    opponent = from;

    if (to == localStorage.name) {
        $(".incoming-inv").css("display", "block");
        document.getElementById("incoming-name").innerHTML = from;
        if (localStorage.sound == 'true') {
            incoming.play();
        }
        setTimeout(() => {
            $(".incoming-inv").css("display", "none");
        }, 10000);
    }
});

// accept invitation. based on which page you are it is gonna emit the invitation for the right type of game.
$(document).on('click', '.incoming-yes', function() {

    if (document.URL.includes("opponent.html")) {
        socket.emit("letsplay", localStorage.name, opponent);

    } else if (document.URL.includes("/room.html")) {
        socket.emit("acceptToJoin", opponent, localStorage.room);
        $(".incoming-inv").css("display", "none");
    }

});

// i decline invitation
$(document).on('click', '.incoming-no', function() {

                      //decline who, bywho
    socket.emit("decline", opponent, localStorage.name);

    $(".incoming-inv").css("display", "none");
});

// starts the 1v1 game
socket.on('readyToPlay', (firstplr, sectplr, rc) => {
  // if i am either of the two names
    if ((firstplr == localStorage.name) || (sectplr == localStorage.name))

    {
        $(".incoming-inv").css("display", "none");
        $(".readyToPlay").css("display", "flex");

        if (localStorage.sound == 'true') {
            turn.play();
        }

        console.log(" WE ARE BEING REDIRECTED chatog");

        //redirect to game room
        setTimeout(() => {
            var redirect = "https://" + localStorage.game + ".wowgames.gr?rc=" + rc;

            window.location.href = redirect;

        }, 3000);
    }

});

// i have been declined
socket.on('declined', (who) => {

    if (who == localStorage.name) {
        document.getElementById("invite-yes").innerHTML = "DECLINED !!";

        setTimeout(() => {

            $("div.invite").css("display", "none");

        }, 4000);

    }

});

// kick player and emit it 
$(document).on('click', '#kick-yes', function() {

    socket.emit("kick", opponent, localStorage.room);

    $("div.invite").css("display", "none");

});