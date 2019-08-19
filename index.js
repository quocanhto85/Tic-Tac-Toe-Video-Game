//run command line: npm init to initialize the project

var express= require('express');
var app = express();
var bodyParser = require('body-parser')
var mysql = require('mysql');
var http = require('http').Server(app);
var session = require('express-session');
//var profile = io.of('/profile')

var io = require('socket.io')(http);

var row, col, cross1, cross2;
var countRow1, countRow2, countCol1, countCol2,
    countCross11, countCross12, countCross21, countCross22;
var player = [];
var winner, loser;

http.listen(3000, function() {
  console.log('Start')
})

//API
//req: stands for request
//res: stands for response

//render the loginPage.html interface
app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/loginPage.html');
})

//push into local
app.use(express.static('public')) 

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'tictactoe'
});

app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//convert pug to html
app.set('view engine', 'pug'); 
app.set('views', './views');

app.get('/test', function(req, res){
  res.render('caroPage')
})

//render the caroPage.html
app.post('/login', function(req, res){
  req.session.dat = "123";
  console.log(req)
  var username = req.body.username;
  var password = req.body.password;
  if(username && password){
    connection.query('SELECT * FROM admin WHERE username = "quocanh98" AND password = "12345678"', [username, password], (error, results, field) => {
      console.log(error)
      console.log(results)
      console.log(field)
      if(results.length > 0)
      {
        req.session.login = true;
        req.session.username = username;
        var temp = 0;
        for(var i = 0; i < player.length; i++){
          if(player[i][0] == results[0].id)
            temp = 1;
        }
          if(temp == 1){
            res.status(200).send({type : 2});
          }
          else{
            player.push([results[0].id, username, results[0].email, results[0].name])
            
            res.status(200).send({url: "/caroPage.pug", username: username, name: results[0].name, 
                              id : results[0].id, email: results[0].email, password: password, type: 1})
          }
      }

      else
        res.status(200).send({message: "Wrong information", type: 0})

      res.end();
    });
  }
});

//API source caro
app.get('/caroPage', function(req, res){
  if(req.session.login){
    res.render('caroPage', {
      username: req.session.username
    });
  }
  else
    res.redirect('/')
  res.end();
})

app.get('/profile', function(req, res){
  res.render('profile');
})

app.get('/account', function(req, res){
  res.render('account');
})

app.get('/setting', function(req, res){
  res.render('account');
})

app.get('/result', function(req, res) {
  res.render('change')
})

app.post('/changeok', function(req, res) {
  console.log(req.body);
  var query = 'UPDATE user SET password = "' + 
  req.body.password + '", name = "' + req.body.name + 
  '", email = "' + req.body.email + '"WHERE username = "' +
  req.body.username + '"';
  console.log(query);
  connection.query(query, function(error, results, fields){
    if(error)
      console.log(error.message)
  })
  res.redirect('/accountPage')
})

app.get('/logout', function(req, res){
  req.session.login = false;
  res.redirect('/')
})

app.post('/register', function(req, res){
  var username = req.body.username;
  var password = req.body.password;
  var name = req.body.name;
  var email = req.body.email;
  if(username && password) {
    var bool = connection.query('SELECT * FROM user', function(error, results, fields){
      var length, temp;
      length = results.length;
      for(i = 0; i < length; i++) {
        if(results[i].username == username) {
          res.status(200).send({type : 0});
          temp++;
          res.end();
          return false;
        }
      }
      connection.query('INSERT INTO user(id, username, password, name, email) VALUES (? , ? , ? , ? , ?)',[length + 1, username, password, name], function(error, results, fields) {
        if(error)
          console.log(error.message)
            res.status(200).send({type: 1, id: length + 1, username: username, password: password, name: name, email: email});
        req.session.login = true;    
      });  
    });
  }
})

//call API when the game is over
app.get('/finish', function(req, res){
  var time = new Date();
  var query = 'INSERT INTO history(winner, loser, time) VALUES('+ winner +', ' 
  + loser +', "'+ time.toGMTString() + '")';
  console.log(query);
  connection.query(query, function(error, results, fields) {
    if(error)
      console.log(error.message)
  });
  console.log("OK finish")
  res.redirect('/caroPage')
})

app.use(express.static('public'))

//Using socket.io to connect 2 players
io.on('connection', function(socket) {
  caro = [];
  for(var i = 0; i < 100; i++) {
    caro.push("");
  }
socket.broadcast.emit('User connect')
console.log('A user connected.' + socket.id);
socket.on('disconnect', function() {
  console.log('User disconnected' + socket.id);
});
socket.on('ferret', function(name, word, fn) {
  fn(socket.id);
});

socket.on('click', function(data) {
  io.sockets.emit('clickall', table(10), socket.id);
  console.log(data);
})

socket.on('clicksquare', function(data) {
  var player_finish = false;
  caro[data.tr * 10 + data.td] = data.text;
  if(count(caro, data.tr, data.td, 10, data.text) == true) {
    winner = data.id_user;
    if(user[0][0] == winner)
      loser = user[1][0];
    else
      loser = user[0][0];
    console.log("The winner is: " + winner);
    console.log("The loser is: " + loser);
    player_finish = true;
  }
  io.sockets.emit('allsquare', data, count(caro, data.tr, data.td, 10, data.text), 
  row, col, cross1, cross2, countRow1, countRow2, countCol1, countCol2, 
  countCross11, countCross12, countCross21, countCross22 , player_win)

  if(count(caro, data.tr, data.td, 10, data.text))
    return false;
})

 socket.on('timeup', function(data) {
   var best = bestScore(caro);
   data.tr = best[0], data.td = best[1];
   data.x = (data.x + 1) % 2;
   data.text = data.text == 'X' ? 'O' : 'X';
   caro[data.tr * 10 + data.td] = data.text;
   if(count(caro, data.tr, data.td, 10, data.text) == true) {
     winner = data.id_user;
   }
   io.sockets.emit('allsquare', data, count(caro, data.tr, data.td, 10, data.text), 
   row, col, cross1, cross2, countRow1, countRow2, countCol1, countCol2, 
   countCross11, countCross12, countCross21, countCross22 , player_win)
 })

 //play with Bot
 socket.on('click_ai', function(data) {
   io.sockets.emit('clickall_ai', table_ai(10), socket.id);
 })
  //server receives request "start" from 1 player
  //then, server send the game interface to play

 socket.on('clicksquare_ai', function(data) {
   caro[data.tr * 10 + data.td] = data.text;

   io.sockets.emit('allsquare_ai', data, count(caro, data.tr, data.td, 10, data.text), 
   row, col, cross1, cross2, countRow1, countRow2, countCol1, countCol2, 
   countCross11, countCross12, countCross21, countCross22 , player_win)
   if(count(caro, data.tr, data.td, 10, data.text))
    return false;

  var best = bestScore(caro);
  data.tr = best[0], data.td = best[1];
  data.x = (data.x + 1) % 2;
  data.text = data.text == 'X' ? 'O' : 'X';
  caro[data.tr * 10 + data.td] = data.text;

  io.sockets.emit('allsquare_ai', data, count(caro, data.tr, data.td, 10, data.text), 
  row, col, cross1, cross2, countRow1, countRow2, countCol1, countCol2, 
  countCross11, countCross12, countCross21, countCross22 , player_win)

 })

 socket.on('pause', function() {
   io.sockets.emit('pause_next')
 })
})


//room and namespaces in socket.io
// profile.on('connection', function(socket) {
// })

// Cell tabel in friend Mode
table = (n) => {
  var html = '';
  html += '<div id = "turn" style = "margin-top: -10px; text-align: center; margin-bottom: 5px; font-size: 200%;"></div>'
  html += '<div style = "position: relative; width: 330px; margin: 0 auto">'
  html += '<div id = "time" style = "text-align: center; margin-bottom: 15px; font-size: 200%;"></div>'
  html += '</div>'
  
  html += '<table id = "table" class = "table">';
  var count = n;
  for(var i = 0; i < count; i++) {
    html += '<tr>';
    for(var j = 0; j < count; j++) {
      html += '<td class = "square"></td>';
    }
    html += '</tr>';
  }
  html += '</table>';
  return html;
}

//Cell table in bot Mode
table_ai = (n) => {
  var html = '';

  html += '<table id = "table" class = "table">';
  var count = n;
  for(var i = 0; i < count; i++) {
    html += '<tr>';
    for(var j = 0; j < count; j++) {
      html += '<td class = "square"></td>';
    }
    html += '</tr>';
  }
  html += '</table>';
  return html;
}
  
count = (td, rowInd, cellInd, maxInd, XO) => {
  countRow1 = 0, countRow2 = 0, countCol1 = 0,
  countCol2 = 0, countCross11 = 0, countCross12 = 0,
  countCross21 = 0, countCross22 = 0;
  
  row = 0, col = 0, cross1 = 0, cross2 = 0;
  var ro = countRow(td, row, countRow1, countRow2, rowInd, cellInd, maxInd, XO);
  row = ro[0];
  countRow1 = ro[1];
  countRow2 = ro[2];

  var co = countCol (td, col, countCol1, countCol2, rowInd, cellInd, maxInd, XO);
  col = co[0];
  countCol1 = co[1];
  countCol2 = co[2];

  var cr1 = countCross1(td, cross1, countCross11, countCross12, rowInd, cellInd, maxInd, XO);
  cross1 = cr1[0];
  countCross11 = cr1[1];
  countCross12 = cr1[2];

  var cr2 = countCross2(td, cross2, countCross21, countCross22, rowInd, cellInd, maxInd, XO);
  cross2 = cr2[0];
  countCross21 = cr2[1];
  countCross22 = cr2[2];

  if(row == 4 || col == 4 || cross1 == 4 || cross2 == 4)
    return true;
}

bestScore = (caro) => {
  var best = -1;
  var index1 = -1;
  var index2 = -1;
  for(var i = 0; i < 10; i++) {
    for(var j = 0; j < 10; j++) {
      if(caro[i * 10 + j] == 'X' || caro[i * 10 + j] == 'O')
        continue;
      var temp11 = countRow(caro, 0, 0, 0, j, i, 10, 'X')
      var temp12 = countCol(caro, 0, 0, 0, j, i, 10, 'X')
      var temp13 = countCross1(caro, 0, 0, 0, j, i, 10, 'X')
      var temp14 = countCross2(caro, 0, 0, 0, j, i, 10, 'X')
      var temp21 = countRow(caro, 0, 0, 0, j, i, 10, 'O')
      var temp22 = countCol(caro, 0, 0, 0, j, i, 10, 'O')
      var temp23 = countCross1(caro, 0, 0, 0, j, i, 10, 'O')
      var temp24 = countCross2(caro, 0, 0, 0, j, i, 10, 'O')
      var x = temp11[0] * temp11[0] + temp12[0] * temp12[0] + temp13[0] * temp13[0] + temp14[0] * temp14[0]
            + temp21[0] * temp21[0] + temp22[0] * temp22[0] + temp23[0] * temp23[0] + temp24[0] * temp24[0]
      if(x > best) {
        best = x;
        index1 = i;
        index2 = j;
      }
    }
  }
  return [index1, index2]
}

countRow = (td, row, countRow1, countRow2, cellInd, rowInd, maxInd, XO) => {
  for(var i = cellInd - 1; i >= 0; i--) {
    if(td[rowInd * 10 + i] == XO)
      countRow1++;    
      else break;
  }
  for(var i = cellInd + 1; i < maxInd; i++) {
    if(td[rowInd * 10 + i] == XO)
      countRow2++;
      else break;
  }
  row = countRow1 + countRow2;
  return[row, countRow1, countRow2]
}

countCol = (td, col, countCol1, countCol2, cellInd, rowInd, maxInd, XO) => {
  for(i = rowInd - 1; i >= 0; i--) {
    if(td[i * 10 + cellInd] == XO)
      countCol1++;
    else break;
    }
    for( i = rowInd + 1; i < maxInd; i++) {
      if(td[i * 10 + cellInd] == XO)
        countCol2++;
      else break;
  }
  col = countCol1 + countCol2;
  return[col, countCol1, countCol2]
  }

countCross1 = (td, cross1, countCross1, countCross2, cellInd, rowInd, maxInd, XO) => {
  for(i = rowInd - 1, j = cellInd - 1;;) {
    if(i < 0 || j < 0)
      break;
    if(td[i * 10 + j] == XO)
      countCross11++;
      else break;
      i--; j--;
  }
  for(i = rowInd + 1, j = cellInd + 1;;) {
    if(i == maxInd || j == maxInd)
      break;
    if(td[i * 10 + j] == XO)
      countCross12++;
      else break;
      i++; j++;
  }
  cross1 = countCross11 + countCross12;
  return [cross1, countCross11, countCross12]
}
  
countCross2 = (td, cross2, countCross21, countCross22, cellInd, rowInd, maxInd, XO) => {
  for(i = rowInd - 1, j = cellInd + 1;;) {
    if(i < 0 || j == maxInd)
      break;
    if(td[i * 10 + j] == XO)
      countCross21++;
      else break;
      i--; j++;
  }
  for(i = rowInd + 1, j = cellInd - 1;;) {
    if(i == maxInd || j < 0)
      break;
    if(td[i * 10 + j] == XO)
      countCross22++;
      else break;
      i++; j--;
  }
  cross2 = countCross21 + countCross22;
  return [cross2, countCross21, countCross22]
}