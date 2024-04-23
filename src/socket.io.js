const SocketIO = require("socket.io") ;
const server = require("./../server").server ;

const cors = { cors : { origin : "*" } } ;
const io = SocketIO( server , cors ) ;

const users = {};
const gameStatus = {};

const winPositions = [
    [0 , 1 , 2] ,
    [3 , 4 , 5] ,
    [6 , 7 , 8] ,
    [0 , 3 , 6] ,
    [1 , 4 , 7] ,
    [2 , 5 , 8] ,
    [0 , 4 , 8] ,
    [2 , 4 , 6]
];



io.on("connection" , socket => {
    let user1 = null;
    let user2 = null;

    socket.emit("newJoinReceive",{
        id : socket.id,
        users: users
    });

    socket.on("newJoin", data => {
        users[socket.id] = data.username;
        socket.broadcast.emit("newJoinBroadcast", {
            username: data.username,
            id: socket.id
        });
        console.clear();
        console.log(users);
    });

    socket.on("inviteRequest", data => {
        socket.to(data.userId).emit("inviteMessage", {
            username : users[socket.id],
            id : socket.id
        });
        user1 = socket.id;
    });

    socket.on("requestAccept", data => {
        socket.to(data.id).emit("readyToPlay",{id:socket.id, username:users[socket.id]});
        user1 = data.id;
        user2 = socket.id;
        gameStatus[user1] = [null, null, null, null, null, null, null, null, null];
    });

    socket.on("gameData", data => {
        user1 == socket.id ? gameStatus[user1][data.index] = true : gameStatus[user1][data.index] = false;
        socket.to(data.id).emit("gameData", { index : data.index, id : socket.id });
        let checked = checkGame(gameStatus[user1]);
        if(checked.value){
            let winData = { position:checked.positions, id:socket.id };
            socket.emit("winData", winData);
            socket.to(data.id).emit("winData", winData);
        }
    });

    socket.on("restartGame", data => {
        data.firstChance ? 
            socket.to(data.id).emit("restartRequest",{firstChance:true}) : 
            socket.to(data.id).emit("restartRequest",{firstChance:false});

        for (let i = 0; i < 9; i++) {
            gameStatus[user1][i] = null;
        }
    });

    socket.on("exit", data => {
        socket.to(data.id).emit("userExit",{});
        delete gameStatus[user1];
    })

    socket.on("disconnect", data => {
        delete users[socket.id];
        socket.broadcast.emit("userLeft",{id:socket.id});
        delete gameStatus[user1];
    });
}) ;

function checkGame(arr){
    let value = false;
    let positions = [];
    winPositions.forEach( winPosition => {
        if(arr[winPosition[0]] == arr[winPosition[1]] && arr[winPosition[1]] == arr[winPosition[2]] && arr[winPosition[2]] != null){
            value = true;
            positions = winPosition;
        } 
    });
    return {value,positions};
};