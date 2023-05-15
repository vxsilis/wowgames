
<div id="top"></div>

<div align="center">
  <a href="https://github.com/vxsilis/wowgames">
<!--     <img src="images/18mblack.png#gh-light-mode-only" alt="Logo"  height="80"> -->

  </a>

<h3 align="center">Wow Games</h3>


[wowgames.gr](http://wowgames.gr) is an online platform in which people can join, invite friends and play 1v1 or tournament of 3 classic games.
    <br />
    <br />
    <a href="https://wowgames.gr/">Play The Game</a>
    ·
    <a href="https://github.com/vxsilis/wowgames/issues">Report Bug</a>
    ·
    <a href="https://github.com/vxsilis/wowgames/issues">Request Feature</a>

</div>

 
**Build with**

 - [node.js](https://nodejs.org/en)
 - [socket.io](http://socket.io)

</br>
<details>
  <summary>Table of Contents</summary>
  <ul>
    <li><a href="#installation">Installation</a></li>
    <li><a href="#play">How to Play</a></li>
    <li><a href="#code">Code</a></li>
    <li><a href="#function">Add Functionalities & Contributions</a></li>
    <li><a href="#license">License</a></li>
  </ul>
</details>

</br>

## Installation

  Download or clone this repo

    git clone https://github.com/vxsilis/wowgames.git


There are 4 folders, 4 separate node applications.

 - **main**, the main website, login, invite friends, make lobbies
 - **dont**, a game like tic-tac-toe, https://dont.wowgames.gr
 - **memory**, a memory game, https://memory.wowgames.gr
 - **four**, a connect four game, https://four.wowgames.gr

Don't visit the links arbitrarily though. The main page will redirect you to the right subdomain that containts the room code as well. They were mentioned just to point out that they run in different domains because they are different applications.

To run these applications, navigate to each one of the folders and run

    npm install

to install all the necessary dependencies

    npm run start

  to start the application . It will print on what port of localhost is currently running.

 For the  *main* folder, on **server.js** you have to connect to a database with a specific architecture for it to work properly.

All over the code there are redirection links that currently point to the live website [wowgames.gr](http://wowgames.gr). So if you use it for your projects probably change them.

If you build it on localhost an idea is to run every app on different port so they all run simultaneously and redirect players from one room to a game etc.  

<div id="play"></div>

## How to Play

If you want to play the games on localhost you can open the address on two DIFFERENT browsers (because this game uses localStorage and it will mess up the information) and play pretending you are two different players. You just have to go to the same room on both windows. For example:

    localhost:8000/?rc=123

 where *rc = room code*.
 
 <p align="right">(<a href="#top">back to top</a>)</p>

## Code

On the 3 games , the file `game.js` contains mostly code about the mechanics of the game while `script.js` contains code that had to do with the socket connection (posting and getting info with the server)

  
There are a lot of comments on the code and the names of the functions most of the times give you a good hint on what’s about it. Ctr+f and trying to search keywords or some of the function that will be mentioned below is gonna be very helpful to learn more about them

  
Below there are the event emits on the **main** app. The parameters for each event are inside the parentheses. 
  
|client emits| server emits  |
|--|--|
|imHere (name)| areUhere |
|chatMessage (msg)| message (msg) |
|checkUsername (usercheck, who)| checkedUser (result) |
|newUser (name socketid)|  |
|checkRoomname (roomname)| checkedRoom (result) |
|newRoom (roomname, roomgame, owner)|  |
|setGame (name, game)|  |
|setInGame (name)|  |
|updateUserSocket (name, socketid)|  |
|giveMePlayers (game, room, type)| takePlayers (results) |
|giveMeRooms (game)| takeRoom (results) |
|invite (from, to)| incoming (from, to) |
|join (from, to)| incomingjoin (from, to) |
|decline (who, bywho)|declined (who)  |
|letsplay (firstplr, secplr)|  |
|countplayers (room) | countplayers (results) |
|acceptToJoin (opponent, room)| imaccepted (opponent,room) |
|kick (name,room)|kicked (name, room)  |
|startTour (room, playersArray)| startTour (results, roomCodes) |
|deleteRoom (room)|  |
|finalWinner (winnerplayers, room)| finalWinner (winnerplayers) |
|getRoomWinners (room)|roomWinners (roomwinners)  |
|imWinner (winner room)|  |
||readyToPlay (firstplr, secplr, newroomcode)  |

Below there are the event emits on the 3 **game** apps.

|client emits| server emits  | comments| 
|--|--|--|
|joinRoom (roomcode)|  || 
|getNumPlayers (roomcode, thePlayer)|gotNumPlayers (numClients)  || 
|gameInitialize (roomcode)| gameInitialized || 
|gameState (whoPlayed, winner, move, roomcode)| gameState (turn, winner, move) |small differences based on game's functionality| 
|wannaPlayAgain (roomcode)| wannaPlayAgain || 
|playagaincode (roomcode, newroomcode)| playagaincode (newroomcode) || 
|iflipped (move, roomcode)| theyflipped (move) |only in "memory" game| 
|shuffleCard(roomcode)| gotCards (array) |only in "memory" game| 


<p align="right">(<a href="#top">back to top</a>)</p>


<div id="#function"></div>

## Add functionalities & Contribution


All of the pages share similar `html` files and layout.
On the game apps, if you want to change something but keep the template of the file you can change the contain after the comment

    <!-- main board -->
or something like that based on the game. Code before and after that should be untouched for them to keep the same structure. For example divs like:

    .down-wave-container
    .incoming-inv
    .up-wave-container
should exist on every page.
On the css files of the games you can add your own styles after the comment

    /* main game STYLES */
and keep the styles after 

    /* general styles */


Do you want to fix a bug, make an enchancement, add a new game? Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement". Don't forget to give the project a star!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## License

View code licence [here](https://github.com/vxsilis/wowgames/blob/main/LICENSE). <br />
All the sounds and assets are free to use except the logo which cannot be used.</br>
For the four or the row game it has been used code from [here](https://github.com/jahid28/Games/tree/main/Connect4).</br>
For the memory game it has been used code from [here](https://www.codingnepalweb.com/build-memory-card-game-html-javascript).</br>
Both codes have been modified with a lot of new additional stuff making them actually turn based games for two different players as well as the functionality to keep track of each player's score and if in case of a tie the game resets without losing the score.



<p align="right">(<a href="#top">back to top</a>)</p>
