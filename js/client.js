var socket = io('http://localhost:3056');
socket.emit('game_find');
window.myColor;

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
});

socket.on('player_move', function(data){

  var newLog = document.createElement('p');
  newLog.innerHTML = data.from.x + data.from.y + " -- " + data.to.x + data.to.y;
  document.getElementById("logbox").insertBefore(newLog, document.getElementById("logbox").childNodes[0]);
  changeBoardFunc(data.from.x, data.from.y, data.to.x, data.to.y);
  moveFigureFunc(data.from.x, data.from.y, data.to.x, data.to.y);

  //меняем цвет
  if(data.playerColor=="white")
  {
    curPlayer=1;
    document.getElementById('turnmessage').innerHTML="Black";
  }
  else {
    curPlayer=0;
    document.getElementById('turnmessage').innerHTML="White";
  }
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
