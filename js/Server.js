var io = require('socket.io').listen(3056);
console.log("server run");

var queue = new Array();
var rooms = new Array();
rooms.push(0);
var playersNumber = 0;

io.sockets.on('connection', function (socket) {

  var currentdate = new Date();
  var datetime = currentdate.getHours() + "." + currentdate.getMinutes() + "." + currentdate.getSeconds();
  var ID = datetime;
  socket.ID = ID;
  playersNumber++;
  queue.push(socket);
  console.log("new socket " + ID + " in queue")

  socket.on('game_find', function(){

    if ( queue.length > 1 )
    {
      /*var socket1 = queue[0];
      var socket2 = queue[1];
      queue.splice(0,2);
      socket1.room = rooms.length-1;
      socket2.room = rooms.length-1;
      rooms.push(rooms.length);
      socket1.join(rooms[rooms.length-1]);
      socket2.join(rooms[rooms.length-1]);
      console.log("created room: " + rooms[rooms.length-1] + " rooms number: " + (rooms.length-1));
      io.sockets.to(rooms[rooms.length-1]).emit('game_found', {hasRoom: true});*/
      rooms.push(rooms.length);
      rooms[rooms.length-1].white = 'white';
      rooms[rooms.length-1].black = 'black';
      (queue[0]).join(rooms[rooms.length-1].white);
      (queue[1]).join(rooms[rooms.length-1].black);
      queue[0].room = rooms.length-1;
      queue[1].room = rooms.length-1;
      console.log("created room: " + rooms[rooms.length-1] + " rooms number: " + (rooms.length-1));
      //io.sockets.to(rooms[rooms.length-1].black).emit('game_found', {color: 'black', roomID: rooms.length-1});
      //io.sockets.to(rooms[rooms.length-1].white).emit('game_found', {color: 'white', roomID: rooms.length-1});
      queue[0].emit('game_found', {color: 'white', roomID: rooms.length-1});
      queue[1].emit('game_found', {color: 'black', roomID: rooms.length-1});
      queue.splice(0,2);
    }
    else
    {
      socket.join(rooms[0]);
      io.sockets.to(rooms[0]).emit('game_find', {hasRoom: false});
      socket.leave(rooms[0]);
    }
  });

  socket.on('disconnect', function ()
  {
    socket.leave(socket.room);
    rooms.splice(socket.room,1);
    playersNumber--;
    console.log(ID + ' disconnected, rooms number: '  + (rooms.length-1) + ' playersNumber: ' + playersNumber);
  });
});
