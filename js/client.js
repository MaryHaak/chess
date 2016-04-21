var socket = io('http://localhost:3056');
socket.emit('game_find');
window.myColor;

socket.on('player_move', function(data){
  move(data);
  
  curPlayer=1-curPlayer;
  if (checkMat())
    socket.emit('turn_mate');
});

socket.on('player_promotion', function(data){
  move(data);

  var newLog = document.createElement('p');
  newLog.innerHTML = data.playerColor + " pawn became " + data.newPiece;
  document.getElementById("logbox").insertBefore(newLog, document.getElementById("logbox").childNodes[0]);
  debugger;
  var x2 = data.to.y;
  var y2 = data.to.x;
  y2=letterToNum(y2);
  changePawn(x2.toString()+y2, data.newPiece);

  curPlayer=1-curPlayer;
  if (checkMat())
    socket.emit('turn_mate');
});

function move(data)
{
  //меняем цвет
  if(data.playerColor=="white")
  {
    curPlayer=0;
    document.getElementById('turnmessage').innerHTML="Black";
  }
  else {
    curPlayer=1;
    document.getElementById('turnmessage').innerHTML="White";
  }
  var x1 = data.from.y;
  var y1 = data.from.x;
  var x2 = data.to.y;
  var y2 = data.to.x;
  y1=letterToNum(y1);
  y2=letterToNum(y2);
  var newLog = document.createElement('p');
  newLog.innerHTML = data.playerColor + " " + data.from.x + data.from.y + " - " + data.to.x + data.to.y;
  document.getElementById("logbox").insertBefore(newLog, document.getElementById("logbox").childNodes[0]);

  //взятие
  if(!checkEnemyCellFreedom(x2.toString()+y2))
  {
    delFigureById(x2.toString()+y2);
  }
  checkENPassantFunc(x1, y1, x2, y2);
  changeBoardFunc(x1, y1, x2, y2);
  console.log("x1 y1 x2 y2" + x1 + " " + y1 + " " + x2 + " " + y2);
  moveFigureFunc(x1, y1, x2, y2);
}

socket.on('game_end', function(data){
  if(data.msg==="leave")
  {
    document.body.removeChild(document.getElementById('board'));
    document.body.removeChild(document.getElementById('turnmessage'));
    document.body.removeChild(document.getElementById('logbox'));

    var helloText = document.createElement('p');
    helloText.setAttribute('id', 'launch');
    helloText.innerHTML = "Another player is disconnected. Are you goind to find another room?";
    document.body.appendChild(helloText);

    var endButton = document.createElement('button');
    endButton.setAttribute('id', 'endbutton');
    endButton.setAttribute('onclick', 'socket.emit(\'game_find\'); document.body.removeChild(document.getElementById(\'endbutton\')); document.body.removeChild(document.getElementById(\'launch\')); firstScreen();');
    endButton.innerHTML = "Yes";
    document.body.appendChild(endButton);
  }
  if(data.msg=="mate")
  {
    var newLog = document.createElement('p');
    newLog.innerHTML = "MAT WINNER: " + data.winnerColor;
    document.getElementById("logbox").insertBefore(newLog, document.getElementById("logbox").childNodes[0]);

    $('body').append('<div id="blackout"></div>');
    var boxWidth = 310;
    var winWidth = $(window).width();
    var winHeight = $(document).height();
    var scrollPos = $(window).scrollTop();
    var disWidth = (winWidth - boxWidth) / 2
    var disHeight = scrollPos + 150;
    $('#smallPopup').css({'width' : boxWidth+'px', 'left' : disWidth+'px', 'top' : disHeight+'px', display: 'block'});
    $('#blackout').css({'width' : winWidth+'px', 'height' : winHeight+'px', display: 'block'});
    var message = document.createElement('p');
    message.innerHTML = "MAT! Winner: " + data.winnerColor;
    document.getElementById("smallPopup").appendChild(message);
  }
});

socket.on('player_castling', function(data){

  //меняем цвет
  if(data.playerColor=="white")
  {
    curPlayer=0;
    document.getElementById('turnmessage').innerHTML="Black";
  }
  else {
    curPlayer=1;
    document.getElementById('turnmessage').innerHTML="White";
  }
  var xOfRook = data.from.y;
  var yOfRook = data.from.x;
  yOfRook=letterToNum(yOfRook);

  var newLog = document.createElement('p');
  newLog.innerHTML = data.playerColor + ": CASTLING " + data.from.x + data.from.y;
  document.getElementById("logbox").insertBefore(newLog, document.getElementById("logbox").childNodes[0]);

  //изменить доску
  //изменить представление
  if(yOfRook==8)
  {
    moveFigureFunc(xOfRook,5,xOfRook,7);
    moveFigureFunc(xOfRook,yOfRook,xOfRook,6);
    changeBoardFunc(xOfRook,5,xOfRook,7);
    changeBoardFunc(xOfRook,yOfRook,xOfRook,6);
  }
  else {
    moveFigureFunc(xOfRook,5,xOfRook,3);
    moveFigureFunc(xOfRook,yOfRook,xOfRook,4);
    changeBoardFunc(xOfRook,5,xOfRook,3);
    changeBoardFunc(xOfRook,yOfRook,xOfRook,4);
  }

  curPlayer=1-curPlayer;
});

socket.on('player_mate', function(){
  var newLog = document.createElement('p');
  newLog.innerHTML = "MAT EVENT FROM OTHER PLAYER - I SHOULD CHECK IT!";
  document.getElementById("logbox").insertBefore(newLog, document.getElementById("logbox").childNodes[0]);
  socket.emit('turnValidation_mate');
  curPlayer=1-curPlayer;

  if(curPlayer==0)
    winner="black"
  else {
    winner="white;"
  }
  if(checkMat())
    socket.emit('turnValidation_mate');
});



socket.on('game_found', function(data){
  myColor = data.color;

  document.body.removeChild(document.getElementById('endbutton'));
  document.body.removeChild(document.getElementById('launch'));
  var script1 = document.createElement('script');
  script1.src = "js/CreateBoard.js";
  document.head.appendChild(script1);
  var script2 = document.createElement('script');
  script2.src = "js/GameAction.js";
  document.head.appendChild(script2);

  document.body.setAttribute("id", data. color);
});

function firstScreen()
{
  var helloText = document.createElement('p');
  helloText.setAttribute('id', 'launch');
  helloText.innerHTML = "We are trying to find another player. Please wait :)";
  document.body.appendChild(helloText);

  var endButton = document.createElement('button');
  endButton.setAttribute('id', 'endbutton');
  endButton.setAttribute('onclick', 'socket.emit(\'game_stopFinding\');');
  endButton.innerHTML = "Stop finding";
  document.body.appendChild(endButton);
}


$(document).ready(function(){
  firstScreen();
});
