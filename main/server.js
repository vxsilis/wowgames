// create server
const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const moment = require('moment');

const formatMessage = require('./utils/messages');
const mysql = require('mysql');

const {
    userJoin,
    updateUser,
    getCurrentUser,
    userLeave,
    getRoomUsers
} = require('./utils/users');

const app = express();
const server = http.createServer(app);

const io = socketio(server);

// Set static client folder
app.use(express.static(path.join(__dirname, 'public')));


//  connect to database
var con = mysql.createConnection({
    host: ,
    port: ,
    user: ,
    password: ,
    database: ,
    multipleStatements: true
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected! ");

});


// function that checks if a player is still online in order to delete him frmo the DB
// checkfordeletion();

function checkfordeletion() {

// set all players for deletion
    var sql = "UPDATE players SET fordelete = 1 WHERE ingame = 0";
    console.log("CHECK");
    con.query(sql, function(err, result) {
        if (err) throw err;
    });

    // select everyone that is not in a game

    var sql = "SELECT socketid FROM players WHERE ingame=0;";
    con.query(sql, function(err, result) {
        if (err) throw err;

        // if you not in a game you should proof that you are still online
        result.forEach((row) => {            
            io.to(row.socketid).emit('areUhere');
        });

    });

// wait 30 secs and delete everyone with fordelete=1 -- if the responded on the "areUhere" the "fordelete" would be =0
    setTimeout(() => {
        var sql = "DELETE FROM players WHERE fordelete = 1";

        con.query(sql, function(err, result) {
            if (err) throw err;
        });

        checkfordeletion();

    }, 30000);

}


// Run when client connects
io.on('connection', socket => {

    socket.on('joinRoom', (username, room) => {
                                      //id, username, type, game, room
        const user = userJoin(socket.id, username, null, null, room);

        socket.join(user.room);

        socket.broadcast.to(user.room);

    });

    // run when client disconnects

    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        var socketleaving = socket.id;
        if (user) {
            
            // Send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });

        }
    });

    // proof that a client is still online - update his "fordelete" =0
    socket.on('imHere', (name) => {
        
        var sql = "UPDATE players SET fordelete = 0 WHERE name = '" + name + "'";

        con.query(sql, function(err, result) {
            if (err) throw err;
        });

    });

    // Listen for chatMessage and emit them to users in the same room
    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

//  check if the username in the homepage is available for use
    socket.on('checkUsername', (usercheck, who) => {

        var sql = "SELECT * FROM players WHERE name = '" + usercheck + "'";

        con.query(sql, function(err, result) {
            if (err) throw err;
            

            io.to(who).emit('checkedUser', result);

        });

    });

// insert new user to DB
    socket.on('newUser', (name, socketid) => {
        var username = name;
        
        var sql = "INSERT INTO players (name, type, game, room, socketid, ingame, kicked) VALUES ('" + username + "', '', '', 'publi', '" + socketid + "', '0' ,'')";
        con.query(sql, function(err, result) {
            if (err) throw err;
            console.log("created user", name);

        });
    });

// check if the room name is available for use
    socket.on('checkRoomname', (roomname) => {
        

        var sql = "SELECT * FROM rooms WHERE name = '" + roomname + "'";

        con.query(sql, function(err, result) {
            if (err) throw err;
            

            io.to(socket.id).emit('checkedRoom', result);

        });

    });

// create new room in DB
    socket.on('newRoom', (roomname, roomgame, owner) => {

        
        var sql = "INSERT INTO rooms (name, game, started, owner, numPlayers, roomcouples, roomwinners) VALUES ('" + roomname + "','" + roomgame + "' , '0','" + owner + "', '1','','')";
        con.query(sql, function(err, result) {
            if (err) throw err;
            console.log("created room", roomname);

        });

/* add player to this room */        

        var sql = "UPDATE players SET room = ? WHERE name = ?";

        let data = [roomname, owner];

        // execute the UPDATE statement
        con.query(sql, data, (error, results, fields) => {
            if (error) {
                return console.error(error.message);
            }
            console.log("updated ROOM for user=", owner);
        });

    });

// set player's game preference
    socket.on('setGame', (name, game) => {
        

        var sql = "UPDATE players SET game = ? WHERE name = ?";

        let data = [game, name];

        
        con.query(sql, data, (error, results, fields) => {
            if (error) {
                return console.error(error.message);
            }
            console.log("updated game for user=", name);

        });

    });

// set player's type of gameplay preference
    socket.on('setType', (name, type) => {
        
        

        var sql = "UPDATE players SET type = ? WHERE name = ?";

        let data = [type, name];

        
        con.query(sql, data, (error, results, fields) => {
            if (error) {
                return console.error(error.message);
            }
            console.log("updated type for user=", name);
        });

    });


// set that player is NOT currently in a game.
    socket.on('setInGame', (name) => {
        console.log("now updating IN GAME...");

        var sql = "UPDATE players SET ingame = ? WHERE name = ?";

        let data = [0, name];

        // execute the UPDATE statement
        con.query(sql, data, (error, results, fields) => {
            if (error) {
                return console.error(error.message);
            }
            console.log("updated IN GAME for user=", name);
        });

    });


// insert player to room in DB
    socket.on('setRoom', (name, room) => {

        var sql = "UPDATE players SET room = ? WHERE name = ?";

        let data = [room, name];

        con.query(sql, data, (error, results, fields) => {
            if (error) {
                return console.error(error.message);
            }
            console.log("updated ROOM for user=", name);
        });

    });

// update players socketid 
    socket.on('updateUserSocket', (name, socketid) => {
        

        var sql = "UPDATE players SET socketid = ? WHERE name = ?";

        let data = [socketid, name];

        
        con.query(sql, data, (error, results, fields) => {
            if (error) {
                return console.error(error.message);
            }
            console.log("updated socketid for user=", name);
        });

    });


// get players of specific room
    socket.on('giveMePlayers', (game, room, type) => {

// if player is in the public room
        if (room === "publi") {
            var sql = "SELECT * FROM players WHERE type = ? AND game = ? AND room = ? AND ingame = ?";

            let data = [type, game, room, 0];

            con.query(sql, data, (error, results, fields) => {
                if (error) {
                    return console.error(error.message);
                }

                io.to(socket.id).emit('takePlayers', results);
            });

// player is in a tournament/private room
        } else {

            var sql = "SELECT * FROM players WHERE type = ? AND game = ? AND room = ?";

            let data = [type, game, room];

            con.query(sql, data, (error, results, fields) => {
                if (error) {
                    return console.error(error.message);
                }

                io.to(socket.id).emit('takePlayers', results);
            });

        }

    });

// get available rooms for specific game
    socket.on('giveMeRooms', (game) => {

        var sql = "SELECT * FROM rooms WHERE (game = '" + game + "' AND numPlayers<6 AND started=0)";

        con.query(sql, function(err, result) {
            if (err) throw err;

            io.to(socket.id).emit('takeRooms', result);

        });
    });


// sending an invitation fir 1v1 game
    socket.on('invite', (from, to) => {

        io.emit('incoming', from, to);
        

    });

// a player wants to join a room - sending invitation to rooms's owner
    socket.on('join', (from, to) => {

        var sql = "SELECT owner AS owner FROM rooms WHERE name = '" + to + "' ";

        con.query(sql, function(err, result) {
            if (err) throw err;


            io.emit('incomingjoin', from, result[0].owner);

        });

    });

// invitation declined -- "who" was declined by "bywho"
    socket.on('decline', (who, bywho) => {

        io.emit('declined', who);

    });

  // accepting 1v1 invitation //1st and 2nd player names
    socket.on('letsplay', (firstplr, secplr) => {

// random generate room code for the player to redirect
        var newroomcode = (Math.random() + 1).toString(36).substring(7);

        io.emit('readyToPlay', firstplr, secplr, newroomcode);

// set these two players that are in game
        var sql = "UPDATE players SET ingame = ? WHERE name = ?";
        var ingame = 1;
        data = [ingame, firstplr];

        con.query(sql, data, (error, result, fields) => {
            if (error) {
                return console.error(error.message);
            }

        });

        var sql = "UPDATE players SET ingame = ? WHERE name = ?";
        var ingame = 1;
        data = [ingame, secplr];

        con.query(sql, data, (error, result, fields) => {
            if (error) {
                return console.error(error.message);
            }

        });

    });

// how many players in room
    socket.on('countplayers', (room) => {

        var sql = "SELECT COUNT(*) AS namesCount FROM players WHERE room = ? AND ingame = ?;";
        var ingame = 0;
        data = [room, ingame];

        con.query(sql, data, (error, result, fields) => {
            if (error) {
                return console.error(error.message);
            }

            io.to(socket.id).emit('countplayers', result[0].namesCount);

        });

    });


// owner accepted player to join the room
  // insert player in room in DB
    socket.on('acceptToJoin', (opponent, room) => {


        var sql = "UPDATE players SET room = ? WHERE name = ?";

        let data = [room, opponent];

        
        con.query(sql, data, (error, results, fields) => {
            if (error) {
                return console.error(error.message);
            }
            
        });

        // increase number of player in the room

        var sql = "UPDATE rooms SET numPlayers = numPlayers+1 WHERE name = ?";

        data = [room];

        
        con.query(sql, data, (error, results, fields) => {
            if (error) {
                return console.error(error.message);
            }
            
        });

        io.emit('imaccepted', opponent, room);

    });

// owner kicks a player out of room
    socket.on('kick', (name, room) => {

        
        // set his room that is public
        var goroom = "publi";

        var sql = "UPDATE players SET room = ? WHERE name = ?";

        let data = [goroom, name];

        con.query(sql, data, (error, results, fields) => {
            if (error) {
                return console.error(error.message);
            }
            console.log("kicked=", name);
        });

        // updated players "kicked" in DB so they wont find this room again

        sql = "UPDATE players SET kicked = ? WHERE name = ?";

        data = [room, name];

        
        con.query(sql, data, (error, results, fields) => {
            if (error) {
                return console.error(error.message);
            }
            console.log("kicked=", name);
        });

        io.emit('kicked', name, room);

        // decrease number of player in this room

        var sql = "UPDATE rooms SET numPlayers = numPlayers-1 WHERE name = ?";

        data = [room];

        
        con.query(sql, data, (error, results, fields) => {
            if (error) {
                return console.error(error.message);
            }
            console.log("updated numPlayers for room=", room);
        });

        

    });


// start room tournament
    socket.on('startTour', (room, playersArray) => {

        // make the players that are on game

        for (let i = 0; i < playersArray.length; i++) {
            var sql = "UPDATE players SET ingame =1 WHERE name = '" + playersArray[i] + "' ";

            con.query(sql, function(err, result) {
                if (err) throw err;

            });

        }

        // make this room 'started' in the database

        var sql = "UPDATE rooms SET started =1 WHERE name = '" + room + "' ";

        con.query(sql, function(err, result) {
            if (err) throw err;
            console.log("ROOM IS STARTING tournament");

        });
        
        // filter dublicate names in players array (for some reaseon safari adds players two times??)
        playersArray = (playersArray.filter((item, index) => playersArray.indexOf(item) === index));
        
        
        var playerNum = playersArray.length;

        var loops;

// make two empty arrays
        var pinakas = []; //contains all the players but with integers. for example . 1,2,3,4. every number is a player
        var playersVS = []; // a shuffled array with the players. for example 4,2,3,1. that means player 4 will play with player 2 etc.

// looping for every player
        for (i = 0; i < playersArray.length; i++) {
            pinakas[i] = playersArray[i];
            playersVS[i] = playersArray[i];
        }


        if ((playerNum == 3) || (playerNum == 4)) {
            loops = 2;
        } else if ((playerNum == 5) || (playerNum == 6)) {
            loops = 3;
        }

        for (var i = 0; i < playerNum; i++) {
            pinakas[i] = i + 1;
        }

// pick a random number for pinakas and put it in playersVS
        for (var i = 0; i < playerNum; i++) {
            const random = Math.floor(Math.random() * pinakas.length);
            var yes = pinakas[random];
            playersVS[i] = yes;
            pinakas.splice(random, 1);
        }

        console.log("couples== ", playersVS);

        var results = ""; // will contain which player play with who but in format of a HTML element in order to be printed directly 

// the first two columns will contain the players' names and the third one the room code that they will be redirected
        let roomCodes = [
            ["", "", ""],
            ["", "", ""],
            ["", "", ""]
        ];

// create the room couples with the room codes
        for (var k = 0; k < playersVS.length; k += 2) {
            if (k == playersVS.length - 1) {
// in this case there is one player left so he wont play. he is wait alone
                roomCodes[k][0] = playersArray[playersVS[k] - 1];
                roomCodes[k][2] = 'alone';
// add "alone" text in html format
                results += playersArray[playersVS[k] - 1] + " <span>WAITING alone...</span>" + "</br>";
            } else {
// if any other case generate random room code for the two players
                roomCodes[k][0] = playersArray[playersVS[k] - 1];
                roomCodes[k][1] = playersArray[playersVS[k + 1] - 1]
                roomCodes[k][2] = (Math.random() + 1).toString(36).substring(5);

                results += playersArray[playersVS[k] - 1] + " <span>VS</span> " + playersArray[playersVS[k + 1] - 1] + "</br>"
            }
        }

// emit to all players in room the results and the roomcodes
        io.to(room).emit('startTour', results, roomCodes);

        // save couples in database

        var sql = "UPDATE rooms SET roomcouples = ? WHERE name = ?";

        data = [results, room];

        
        con.query(sql, data, (error, results, fields) => {
            if (error) {
                return console.error(error.message);
            }
            console.log("updated roomcouples =", roomCodes, "__name__", room);
        });

        // modify roomcouples with the format of (playing now) and save to roomwinners

        var search, replaceWith;

        if ((playerNum == 4) || (playerNum == 6)) {
          // seach for every break line
            search = '</br>';
            // replace the break line with "playing now"
            replaceWith = '<span>(playing now)</span></br>';
            results = results.split(search).join(replaceWith);

        } else { // 3 or 5 players
            // basically replacing all the break lines but not the last one
            let regex = /(?<!<\/span>)<\/br>/g;
            results = results.replace(regex, '<span>(playing now)</span></br>');
// the last one will have "alone" in the end
            search = 'WAITING alone...';
            replaceWith = '(alone)';
            results = results.split(search).join(replaceWith);
            

        }

// save roomwinners to DB
        var sql = "UPDATE rooms SET roomwinners = ? WHERE name = ?";

        data = [results, room];

        
        con.query(sql, data, (error, results, fields) => {
            if (error) {
                return console.error(error.message);
            }
            console.log("updated roomwinners =", results, "__name__", room);
        });

    });
    // TELOS START TOUR


// delete a room
    socket.on('deleteRoom', (room) => {

        var sql = "DELETE FROM rooms WHERE name = '" + room + "' ";

        con.query(sql, function(err, result) {
            if (err) throw err;
            console.log("delted room");

        });

    });


// we have the winner of a tourname
    socket.on('finalWinner', (winnerplayers, room) => {

        io.to(room).emit('finalWinner', winnerplayers);

    });


// roomwinner is currently the couples that play + who is the winner between couples inside a parentheses
    socket.on('getRoomWinners', (room) => {

        var sql = "SELECT roomwinners FROM rooms WHERE name = '" + room + "' ";

        
        con.query(sql, data, (error, results) => {
            if (error) {
                return console.error(error.message);
            }

            roomwinners = results;
            roomwinners = roomwinners[0].roomwinners;
            io.to(room).emit('roomWinners', roomwinners);
        });

    });

    // when a player comes to playroom and he just won a game we have to update the database
    socket.on('imWinner', (winner, room) => {

        // get the roomwinner (which is currently roomcouples + who is the winner between couples)

        var roomwinners, stringBefore, stringAfter;
        

        
        var sql = "SELECT roomwinners FROM rooms WHERE name = ?";

        data = [room];

        
        con.query(sql, data, (error, results) => {
            if (error) {

                return console.error(error.message);

            }
            
            roomwinners = results;
            roomwinners = roomwinners[0].roomwinners;

            
            var hasalreadychangedit = 0; // works as a flag that we havent already added this player as a winner in the db

// find every string between parentheses- the string is a player's name or "playing now" or "alone"
            let regex = /\((.*?)\)/g;
            let match;

// loop through every string found between parentheses
            while ((match = regex.exec(roomwinners))) {
                
                if ((match[1] == winner)) {
                    hasalreadychangedit = 1;
                    break;
                }
            }

// if the player's name is not found that means that we havent updated the db for this winner
            if (hasalreadychangedit == 0) {

// split the string between and after the player's name and replace "playing now" with his name
                stringBefore = roomwinners.split(winner)[0];

                stringBefore = stringBefore + winner;
                stringAfter = roomwinners.split(winner)[1];

                stringAfter = stringAfter.replace('playing now', winner);

                roomwinners = stringBefore + stringAfter;
                

                var sql = "UPDATE rooms SET roomwinners = ? WHERE name = ?";

                data = [roomwinners, room];


                con.query(sql, data, (error, results, fields) => {
                    if (error) {
                        return console.error(error.message);
                    }

                });

            }

// emit to everyone the updates room winners (with updated results)
            io.to(room).emit('roomWinners', roomwinners);
            
        });

    }); 

});

// const PORT = process.env.PORT || 49637;

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));