// create server

const express = require('express');
const app = express();
const path = require('path');
const http = require('http').Server(app);

//assing port
const port = process.env.PORT || 8080;
// const port = process.env.PORT || 50572;


//turn is who JUST PLAYED!

//score1 (and player1) is the score of the first player that connects to the room
var turn, winner, move, arr, score1, score2;

//attach http server to the socket.io
const io = require('socket.io')(http);
app.use(express.static(path.join(__dirname, 'public')));


// shuffle deck. every card is two times in the deck and emit it to players in specific room
function shuffleCards(roomcode) {
    arr = [1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8];
    arr.sort(() => Math.random() > 0.5 ? 1 : -1);
    io.to(roomcode).emit('gotCards', arr);
}


//attach http server to the socket.io
io.on('connection', socket => {
    
// when a user disconnects emit it to other player on the room
    socket.on('disconnecting', function() {
        
        let arr = Array.from(socket.rooms);
        const clients = io.sockets.adapter.rooms.get(arr[1]);
        const numClients = clients ? clients.size : 0;
        
 // if the num of players in the room is >2 it means that the 3rd player who is about to disconnect 
        // was a player that doesnt belong to this room so DONT let the other players know
        if (numClients <= 2) {
            setTimeout(() => {
                io.to(arr[1]).emit('disconnected');
            }, 2000);
        }
    });

    // when player joins room add him to the socket room
    socket.on('joinRoom', function(roomcode) {
        socket.join(roomcode);
      
    })


    //to get the number of clients in this room // theyplayer who asked 
    socket.on('getNumPlayers', function(roomcode, thePlayer) {
        
        const clients = io.sockets.adapter.rooms.get(roomcode);
        
        //to get the number of clients in this room
        const numClients = clients ? clients.size : 0;
        
        //emit the same event to all players of a room
        io.to(socket.id).emit('gotNumPlayers', numClients);
        
// if there is 1 player = means he is the first one to connect. remember his name to assing the turn
        if (numClients == 1) {
            
            turn = thePlayer;
            winner = "none";
            move = "none";
            score1 = 0;
            score2 = 0;
            
        }

        if (numClients == 2) {
            shuffleCards(roomcode);
        }
    })


    socket.on('gameInitialize', function(roomcode) {

    	// send to players in "roomcode" that game starts
        io.to(roomcode).emit('gameInitialized');

        io.to(roomcode).emit('gameState', turn, winner, move, score1, score2);
    })

// emit gamestate to players of specific room
    socket.on('gameState', function(whoPlayed, winner, move, score1, score2, roomcode) {
        io.to(roomcode).emit('gameState', whoPlayed, winner, move, score1, score2);

    })

// someone flipped a card - let the opponent know
    socket.on('iflipped', function(move, roomcode) {

        socket.broadcast.to(roomcode).emit('theyflipped', move);
    });

// someone asked the server to shuffle the cards
    socket.on('shuffleCard', function(roomcode) {
        shuffleCards(roomcode);
    });

    // send to player in room except the sender that the opponent wants to play again
    socket.on('wannaPlayAgain', function(roomcode) {
        socket.broadcast.to(roomcode).emit('wannaPlayAgain');
    });


// got the random generated number from the player. emit it to the second player so they redirect
    socket.on('playagaincode', function(roomcode, newroomcode) {
        io.to(roomcode).emit('playagaincode', newroomcode);
    });
})



http.listen(port, () => {
    console.log(`app listening on port ${port}`)
})