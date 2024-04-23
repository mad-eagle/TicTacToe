const socket = io();
const UserList = document.getElementById("usersList");
const notificationBox = document.getElementById("notificationList");
const exitBtn = document.getElementById("exitBtn");
const restartBtn = document.getElementById("restartBtn");
const page1 = document.getElementById("page1");
const page2 = document.getElementById("page2");
const boxes = document.querySelectorAll(".box");
const gameStatus = document.getElementById("gameStatus");
let emptySpace = [true, true, true, true, true, true, true, true, true];
let users = {};
let myId = null;
let opponentId = null;
let opponentName = null;
let firstChance = false;



let gameRunning = false;
let yourTurn = false;


socket.on("newJoinReceive", data => {
    addUser(username, null, true);
    socket.emit("newJoin", {username});
    myId = data.id;
    Object.keys(data.users).forEach( element => {
        addUser(data.users[element], element);
    });
});
socket.on("newJoinBroadcast", data => {
    addUser(data.username,data.id);
});
socket.on("inviteMessage", data => {
    requestMessage(data.username, data.id);
});
socket.on("readyToPlay", data => {
    opponentId = data.id;
    opponentName = data.username;
    page1.style.display = "none";
    page2.style.display = "flex";
    gameStatus.textContent = "Your Turn";
    gameRunning = true;
    yourTurn = true;
    firstChance = true;
})
socket.on("gameData", data => {
    console.log("gameData received")
    yourTurn = true;
    let card = document.createElement("div");
    card.classList.add("card","oponentCard");
    card.textContent = "O";
    boxes[data.index].appendChild(card);
    emptySpace[data.index] = false;
    gameStatus.textContent = "Your Turn";
});
socket.on("winData", data => {
    let winMe = data.id == myId ? true : false ;
    gameRunning = false;
    yourTurn = false;
    data.position.forEach( i => {
        boxes[i].classList.add("winCard");
    });
    winMe ? gameStatus.textContent = "You Won" : gameStatus.textContent = `${opponentName} Won`;
    winMe ? restartBtn.style.display = "block" : setTimeout( arg => {
        restartBtn.style.display = "block";
    },3000);
});
socket.on("restartRequest", data => {
    restartBtn.style.display = "none";
    gameRunning = true;
    if(data.firstChance){
        gameStatus.textContent = "Your Turn";
        firstChance = true;
        yourTurn = true;
        
    }else{
        gameStatus.textContent = "Opponent Turn";
    }
    for (let i = 0; i < boxes.length; i++) {
        boxes[i].innerHTML = "";
        emptySpace[i] = true;
        boxes[i].classList.remove("winCard");
    };
});
socket.on("userExit", data => {
    page2.style.display = "none";
    page1.style.display = "flex";
    restartBtn.style.display = "none";
    gameRunning = false;
    yourTurn = false;
    firstChance = false;
    opponentId = null;
    opponentName = null; 

    for (let i = 0; i < boxes.length; i++) {
        boxes[i].innerHTML = "";
        emptySpace[i] = true;
        boxes[i].classList.remove("winCard");
    };  
})

socket.on("userLeft", data => {
    page2.style.display = "none";
    page1.style.display = "flex";
    UserList.removeChild(users[data.id])
    delete users[data.id];
    if(data.id == opponentId){
        gameRunning = false;
        yourTurn = false;
        firstChance = false;
        restartBtn.style.display = "none";
        opponentId = null;
        opponentName = null;

        for (let i = 0; i < boxes.length; i++) {
            boxes[i].innerHTML = "";
            emptySpace[i] = true;
            boxes[i].classList.remove("winCard");
        };
    }
});


boxes.forEach((box, index) => {
    box.addEventListener("click", e => {
        if (gameRunning && yourTurn && emptySpace[index]) {
            let card = document.createElement("div");
            card.classList.add("card","myCard");
            card.textContent = "X";
            boxes[index].appendChild(card);
            yourTurn = false;
            emptySpace[index] = false;
            socket.emit("gameData", {index, id:opponentId});
            gameStatus.textContent = "Opponent Turn" ;
        }
    });
});

exitBtn.addEventListener("click", e => {
    page2.style.display = "none";
    page1.style.display = "flex";
    restartBtn.style.display = "none";
    socket.emit("exit",{id:opponentId});
    gameRunning = false;
    yourTurn = false;
    firstChance = false;
    opponentId = null;
    opponentName = null; 

    for (let i = 0; i < boxes.length; i++) {
        boxes[i].innerHTML = "";
        emptySpace[i] = true;
        boxes[i].classList.remove("winCard");
    };
});

restartBtn.addEventListener("click", e => {
    socket.emit("restartGame",{firstChance,id:opponentId});
    restartBtn.style.display = "none";
    gameRunning = true;
    
    for (let i = 0; i < boxes.length; i++) {
        boxes[i].innerHTML = "";
        emptySpace[i] = true;
        boxes[i].classList.remove("winCard");
    }
    if(firstChance){
        firstChance = false;
        gameStatus.textContent = "Opponent Turn";
    }else{
        gameStatus.textContent = "Your Turn";
        yourTurn = true;
    }
});

function addUser(userName="Unknown User", socketId, isSelf=false) {
    let userInviteState = true;
    
    let addIconElement = document.createElement("img");
    addIconElement.setAttribute("src","resources/add-circle-outline.svg");
    
    let userAddBtn = document.createElement("div");
    userAddBtn.classList.add("userAddBtn");
    
    userAddBtn.append(addIconElement);
    
    let userNameElement = document.createElement("div");
    userNameElement.textContent = userName;
    userNameElement.classList.add("username");
    
    let userBoxElement = document.createElement("div");
    userBoxElement.classList.add("userBox");
    isSelf ? userBoxElement.style.background = "hotpink" : null
    
    isSelf ? userBoxElement.appendChild(userNameElement) : userBoxElement.append(userNameElement,userAddBtn);
    
    UserList.appendChild(userBoxElement);
    //Code
    users[socketId] = userBoxElement;

    userAddBtn.addEventListener("click", e => {
        if(userInviteState){
            console.log(userName,"Invited");
            userAddBtn.classList.add("userAddBtnClicked");
            userInviteState = false;
            setTimeout(params => {
                userAddBtn.classList.remove("userAddBtnClicked");
                userInviteState = true;
            },5000);

            socket.emit("inviteRequest", {userId : socketId});
        }
    });

    return {
        userElement : userBoxElement,
        userNameElement : userNameElement,
        userAddBtnElement : userAddBtn,
        userAddIconElement : addIconElement
    }
}

function requestMessage(requestingUser="Unknown",requestingUserId){
    let notificationListed = true;

    let acceptBtn = document.createElement("div");
    acceptBtn.classList.add("accept");
    acceptBtn.textContent = "Accept";

    let rejectBtn = document.createElement("div");
    rejectBtn.classList.add("reject");
    rejectBtn.textContent = "Reject";

    let buttonBox = document.createElement("div");
    buttonBox.classList.add("buttonBox");
    buttonBox.append(acceptBtn,rejectBtn);

    let messageBox = document.createElement("div");
    messageBox.classList.add("messageBox");
    messageBox.textContent = `${requestingUser} invite you`;

    let notification = document.createElement("div");
    notification.classList.add("notification");
    notification.append(messageBox,buttonBox);

    notificationBox.appendChild(notification);



    acceptBtn.addEventListener("click", e => {
        notificationBox.removeChild(notification);
        notificationListed = false;
        // Code
        socket.emit("requestAccept",{id : requestingUserId});
        opponentId = requestingUserId;
        opponentName = requestingUser;
        page1.style.display = "none";
        page2.style.display = "flex";
        gameRunning = true;
        gameStatus.textContent = "Opponent Turn"
    });
    rejectBtn.addEventListener("click", e => {
        notificationBox.removeChild(notification);
        notificationListed = false;
        // Code
    });


    setTimeout( parms => {
        if(notificationListed){
            notificationBox.removeChild(notification);
            notificationListed = false;
            // Code
        }
    },5000);
};