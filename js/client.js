$(document).ready(function(){
  var launchPage = document.createElement('div');
  launchPage.setAttribute('id', 'launch');
  document.body.appendChild(launchPage);
  var helloText = document.createElement('p');
  launchPage.innerHTML = "We are trying to find another player. Please wait :)";
  document.getElementById('launch').appendChild(helloText);
});

var socket = io('http://localhost:3056');
socket.emit('game_find');

socket.on('game_found', function(data){
  debugger;
  document.body.removeChild(document.getElementById('launch'));
  var script1 = document.createElement('script');
  script1.src = "js/CreateBoard.js";
  document.head.appendChild(script1);
  var script2 = document.createElement('script');
  script2.src = "js/GameAction.js";
  document.head.appendChild(script2);

  document.body.setAttribute("id", data. color);
});
