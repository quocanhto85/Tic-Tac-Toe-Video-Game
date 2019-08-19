// import { start } from "repl";
// import { deflateRaw } from "zlib";
console.log("Start")
var socket = io('http://localhost:3000/');

var x = 1;
var i;
var turn;
//var idUser = 0;
var col = 0, row = 0, cross1 = 0, cross2 = 0;
var countClick = 0;
var rowCurrent = -1, ceilCurrent = -1;
var rowInd, cellInd;
var BTN1 = $('#btn1');
var BTN2 = $('#btn2');
var pause;
var td = document.getElementsByTagName('td');

var User = [];
var timeup = 30;

socket.on('connect', function() {
    socket.emit('ferret', 'QA', 'woot', function(data) {
      console.log(data); // data will be 'QA says woot'
      User.push(data);  
    });
});

//The user clicks the button "Start"
BTN1.click(function() {
    socket.emit('click', sessionStorage.getItem("id"));    
})

//The game interface appears
socket.on('clickall', function(table,id) {
    document.getElementById("caro").innerHTML = table;
    //The player click on any cell
    console.log(id)
    document.getElementById("time").innerHTML = "45";
    start();
    if(x == 1 && id == User[0]) {
        turn = 1;
        document.getElementById("turn").innerHTML = "Your turn"        
    }

    else {
        turn = 0;
        document.getElementById("turn").innerHTML = "Opponent's turn"         
    }

    document.getElementById('table').addEventListener('click', function(e) {
    if(x == 0 && id == User[0])
        return false;  
    if(x == 1 && id != User[0])
        return false;

    if(e.path[0].tagName == 'TD' && e.path[0].innerHTML == "") {
       if(x % 2) {
           e.target.innerHTML = "X";
           countClick++;
       } 
       else {
           e.target.innerHTML = "O";
           countClick++;
       }
       x = ++x % 2;
    } 
    else return false;
    console.log(sessionStorage.getItem("id"));
    //The player sends data by the cell clicked
    socket.emit('clicksquare', {id: id, id_user: sessionStorage.getItem("id"), tr: e.path[1].rowIndex, td: e.path[0].cellIndex, text: e.path[0].innerHTML, x: x, 
    rowCur: rowCurrent, cellCur: ceilCurrent, caro: caro, countClick: countClick})
    stop();
    });
})

//The player always receive state game round from server
//The player always automatically update score to win
//The player automatically get notified "finish" and "draw" whenever the game is over

socket.on('allsquare', function(data, count, row, col, cross1, cross2, countRow1, countRow2,
     countCol1, countCol2, countCross11, countCross12, countCross21, countCross22, winner){
   stop();    
})

timeup = 45;
turn = ++ turn % 2;
if(turn == 1)
    document.getElementById("turn").innerHTML = "Your turn"
else
    document.getElementById("turn").innerHTML = "Opponent's turn"
start();
countClick = data.countClick;
x = data.x;
rowCurrent = data.tr;
ceilCurrent = data.td;
td[data.tr * 10 + data.td].innerHTML = data.text;
draw(data.tr, data.td, data.rowCur, data.cellCur);

if(row == 4) {
    td[data.tr * 10 + data.td].style.backgroundColor = "red";
    for(i = 1; i <= countRow1; i++) {
        td[data.tr * 10 + data.td - i].style.backgroundColor = "red";        
    }
    for(i = 1; i <= countRow2; i++) {
        td[data.tr * 10 + data.td + i].style.backgroundColor = "red";
    }
}

if(col == 4) {
    td[data.tr * 10 + data.td].style.backgroundColor = "red";
    for(i = 1; i <= countCol1; i++) {
        td[(data.tr - i) * 10 + data.td].style.backgroundColor = "red";
    }
    for(i = 1; i <= countCol2; i++) {
        td[(data.tr + i) * 10 + data.td].style.backgroundColor = "red";     
    }    
}

if(cross1 == 4) {
    td[data.tr * 10 + data.td].style.backgroundColor = "red";
    for(i = 1; i <= countCross11; i++) {
        td[data.tr * 10 + data.td - i].style.backgroundColor = "red";
    }
    for(i = 1; i <= countCross12; i++) {
        td[data.tr * 10 + data.id + i].style.backgroundColor = "red";
    }
}

if(cross2 == 4) {
    td[data.tr * 10 + data.td].style.backgroundColor = "red";
    for(i = 1; i <= countCross21; i++) {
        td[data.tr * 10 + data.td + i].style.backgroundColor = "red";
    }
    for(i = 1; i <= countCross22; i++) {
        td[data.tr * 10 + data.id - i].style.backgroundColor = "red";
    }
}

//Check whether the game is over and notify
if(countClick > 7)
    if(count) {
        document.getElementById("table").classList.remove("table");
        setTimeout(() => {
           console.log(winner);
           if(data.x == 0) {
               if(data.id == User[0]) {
                   window.alert("YOU WIN");
               }
               else {
                   window.alert("YOU LOSE");
               }
           } 
           else
                if(data.id == User[0]) {
                    window.alert("YOU LOSE");
                }
                else {
                    window.alert("YOU WIN");
                }
            console.log(winner == sessionStorage.getItem("id"));
            if(winner == sessionStorage.getItem("id")) {
               window.location = "/finish";
               console.log("Game Over") 
            }
            else {
                location.reload();
            }
        }, 300);
    }

draw = (rowInd, cellInd, rowCur, cellCur) => {
    if(rowCur >= 0) {
        td[rowCur * 10 + cellCur].style.backgroundColor = "";
    }
        td[rowInd * 10 + cellInd].style.backgroundColor = "gray";
}

BTN2.click(function() {
    alert(123)
    socket.emit('click_ai', 'click_ai')
})

//The game interface appears
socket.on('clickall_ai', function(table, id) {
   document.getElementById("caro").innerHTML = table;
   //The player click on any cell

   document.getElementById('table').addEventListener('click', function(e) {
        if(x == 0 && id == User[0])
            return false;
        if(x == 1 && id != User[0])
            return false;
        console.log(e);
        if(e.path[0].tagName == 'TD' && e.path[0].innerHTML == "") {
           if(x & 2) {
               e.target.innerHTML = "X";
               countClick++;
           }
           else {
               e.target.innerHTML = "O";
               countClick++;
           } 
           x = ++x % 2;
        }
        else return false;
        //The player receive data by the cell clicked
        socket.emit('clicksquare_ai', {id : id,tr : e.path[1].rowIndex,td : e.path[0].cellIndex,text : e.path[0].innerHTML, x : x,
        rowCur : rowCurrent, cellCur : ceilCurrent, caro : caro}) 
   });
})

//The player always receive state game round from server
//The player always automatically update score to win
//The player automatically get notified "finish" and "draw" whenever the game is over
socket.on('allsquare_ai', function(data, count, row, col, cross1, cross2, countRow1, 
countRow2, countCol1, countCol2, countCross11, countCross12, countCross21, countCross22){
    countClick++;

    x = data.x;
    rowCurrent = data.tr;
    ceilCurrent = data.td;
    td[data.tr * 10 + data.td].innerHTML = data.text;
    draw(data.tr, data.td, data.rowCur, data.cellCur);
    //if row, col, cross1, cross2 = 4, it means the player has won the match, and the red cell will be highlighted
    if(row == 4) {
        td[data.tr * 10 + data.td].style.backgroundColor = "red";
        for(i = 1; i <= countRow1; i++) {
            td[data.tr * 10 + data.td - i].style.backgroundColor = "red";
        }
        for(i = 1; i <= countRow2; i++) {
            td[data.tr * 10 + data.td + i].style.backgroundColor = "red";
        }
    }

    if(col == 4) {
        td[data.tr * 10 + data.td].style.backgroundColor = "red";
        for(i = 1; i <= countCol1; i++) {
            td[(data.tr - i) * 10 + data.td].style.backgroundColor = "red";
        }
        for(i = 1; i <= countCol2; i++) {
            td[(data.tr + 1) * 10 + data.td].style.backgroundColor = "red";
        }
    }

    if(cross1 == 4) {
        td[data.tr * 10 + data.td].style.backgroundColor = "red";
        for(i = 1; i <= countCross11; i++) {
            td[(data.tr - 1) * 10 + data.id - i].style.backgroundColor = "red";
        }
        for(i = 1; i <= countCross12; i++) {
            td[(data.tr - 1) * 10 + data.id + i].style.backgroundColor = "red";
        }
    }

    if(cross2 == 4) {
        td[data.tr * 10 + data.td].style.backgroundColor = "red";
        for(i = 1; i <= countCross21; i++) {
            td[(data.tr - 1) * 10 + data.id + i].style.backgroundColor = "red";
        }
        for(i = 1; i <= countCross22; i++) {
            td[(data.tr - 1) * 10 + data.id - i].style.backgroundColor = "red";
        }
    }

    if(countClick > 7)
        if(count) {
           document.getElementById("table").classList.remove("table"); setTimeout(() => {
               if(data.x == 0) {
                  if(data.id == User[0])
                    window.alert("YOU WIN");
                  else
                    window.alert("YOU LOSE"); 
               }
               else
                   if(data.id == User[0])
                     window.alert("YOU LOSE");
                   else
                     window.alert("YOU WIN");
               
               location.reload()}, 300); 
        }
})

function start()
{
    if(timeup == -1) {
        clearTimeout(timeout);
        var text;
        countClick++;
        if(turn == 1) {
            if(x)
                text = "O"
            else
                text = "X"
            console.log(x + " " + text)
            socket.emit('timeup', {x : x, text: text, rowCur : rowCurrent, cellCur : ceilCurrent, 
            caro : caro, countClick : countClick});
        }
        return false;
    }

    //DISPLAYING CLOCK
    document.getElementById('time').innerHTML = timeup.toString();
    timeout = setTimeout(function() {
        timeup--;
        start();
    }, 1000);
}

function stop() {
    clearTimeout(timeout);
}