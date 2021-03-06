$(document).ready(function(){

//мат+
//шах+
//защита короля+
//рокировка+
//взятие на проходе+
//превращение пешки+

//пат
//баг для пешки (не перескакивать)
//рокировка - для фигур, которые еще не сдвигались?
//рокировка во время шаха?
//обновить github



//логи ходов
var logBox = document.createElement('div');
logBox.setAttribute('id','logbox');
document.body.appendChild(logBox);
var newLog = document.createElement('p');
newLog.innerHTML = "Your color: " + document.body.getAttribute("id");
document.getElementById("logbox").insertBefore(newLog, document.getElementById("logbox").childNodes[0]);

/*
socket.on('game_find', function(data){
  var massage = jQuery.parseJSON(data);

  var newLog = document.createElement('p');
  if(data.hasRoom)
    newLog.innerHTML = "You have the room and can start game";
  else
    newLog.innerHTML = "You should wait for other player";
  document.getElementById("logbox").insertBefore(newLog, document.getElementById("logbox").childNodes[0]);
});*/

  //информация о текущем ходе
  window.curPlayer = 0; //0-white, 1-black
  var curColor = null;
  var curFigure = null;
  var curPos = null;
  var curNumber = null;
  var curLetter = null;
  var curPossibleCells = null;
  var shah = false;
  var shahThreat = null;
  var killer = null;
  var shahCheking=false;
  var curPossibleCells = null;//ходы текущего игрока
  var globalPossibleCells;//глобальная служебная переменная
  var possibleCastlingRooks;
  var wasWhiteCastling = false;
  var wasBlackCastling = false;
  var possibleENPassants; //возможные взятия на проходе

  //создаем сообщение о текущем игроке
  var turnMessage = document.createElement('div');
  turnMessage.setAttribute('id','turnmessage');
  turnMessage.innerHTML="Current player:" + "White";
  document.body.appendChild(turnMessage);


  $(".figure").draggable({
    containment: "#board",
    stack:'.figure',
    grid:[75,75],
    snap: ".cell",
    start: handleDragStart
  });
  $(".cell").droppable({
    drop: handleDropEvent
  });


  function handleDragStart(event,ui)
  {
    if($(event.target).hasClass("whitefigure"))
      curColor = "white"
    else
      curColor = "black";
    curFigure = getCurFigure(event.target);
    curNumber = $(event.target).attr("id")[0];
    curLetter = $(event.target).attr("id")[1];
    curPos = curNumber+curLetter;
    possibleENPassants = new Array();

    //очередность ходов
    if(((curPlayer===0 && curColor==="black") || (curPlayer===1 && curColor==="white")) || (myColor==="white" && curPlayer===1) || (myColor==="black" && curPlayer===0))
    {
      $(".figure").draggable( "option", "revert", true );
    }
    else {
      $(".figure").draggable( "option", "revert", false );
      //определение потенциально возможных ходов

      curPossibleCells = getPossibleCells(curPos,curNumber,curLetter,curFigure);
      //убираем шаги, которые приведут к шаху
      for (var i=0; i<curPossibleCells.length; i++)
        if(checkConcreteCellShah(curPos, curPossibleCells[i]))
        {
          curPossibleCells.splice(i,1);
          i=i-1;
        }
      //проверяем на возможность сделать рокировку
      checkCastlingPossibility();
      //закрашиваем ячейки
      for (var i=0; i<curPossibleCells.length; i++)
        $(document.getElementById("cell"+curPossibleCells[i])).addClass("possiblecell");
      if(possibleCastlingRooks!=null)
        for (var i=0; i<possibleCastlingRooks.length; i++)
          $(document.getElementById("cell"+possibleCastlingRooks[i].id)).addClass("possibleCastling");
      if(curPossibleCells.length==0)
      {
        var newLog = document.createElement('p');
        newLog.innerHTML = "----------PAT----------";
        document.getElementById("logbox").insertBefore(newLog, document.getElementById("logbox").childNodes[0]);
      }
    }
  }


  function handleDropEvent(event,ui)
  {

    if((curPlayer===0 && curColor==="black") || (curPlayer===1 && curColor==="white")  || (myColor==="white" && curPlayer===1) || (myColor==="black" && curPlayer===0))
    {
      $(".figure").draggable( "option", "revert", true );
    }
    else {
      $(".figure").draggable( "option", "revert", false );

    var curCell = $(event.target).attr("id").substr(4,2);

    //отмена подсвечивания возможных ходов
    if (curPossibleCells!=null)
      for (var i=0; i<curPossibleCells.length; i++)
        $(document.getElementById("cell"+curPossibleCells[i])).removeClass("possiblecell");
    if(possibleCastlingRooks!=null)
      for (var i=0; i<possibleCastlingRooks.length; i++)
        $(document.getElementById("cell"+possibleCastlingRooks[i].id)).removeClass("possibleCastling");

    if ( (curPossibleCells!=null && checkCurCell(curCell)) || (possibleCastlingRooks!=null && possibleCastlingRooks.length>0))
    {
      $(".figure").draggable( "option", "revert", false );

      //сохраняем текущее положение фигуры
      //document.getElementById(ui.draggable.prop("id")).setAttribute("id",curCell);

      if( possibleCastlingRooks!=null && possibleCastlingRooks.length>0 && (curCell===possibleCastlingRooks[0].id || curCell===possibleCastlingRooks[1].id) )
      {
        $(ui.helper).css("left","");
        $(ui.helper).css("top","");
        castlingFunc(curCell);
        possibleCastlingRooks=null;
        //пишем лог
        var newLog = document.createElement('p');
        newLog.innerHTML = curPos + " - " + curCell + " CASTLING";
        document.getElementById("logbox").insertBefore(newLog, document.getElementById("logbox").childNodes[0]);
        socket.emit('turn_castling', {from:{x:numToLetter(curCell[1]), y:curCell[0]}});

        curPlayer=1-curPlayer;

        if(curPlayer===0)
          document.getElementById('turnmessage').innerHTML="White";
        else
          document.getElementById('turnmessage').innerHTML="Black";

        //проверка шаха
        checkShah();
        checkMat();

        return;
      }
      else
      {
        //пишем лог
        var newLog = document.createElement('p');
        newLog.innerHTML = curColor + " " + curFigure + " " + curPos + " - " + curCell;
        document.getElementById("logbox").insertBefore(newLog, document.getElementById("logbox").childNodes[0]);

        //взятие
        if(!checkEnemyCellFreedom(curCell))
        {
          //удаляем фигуру
          delFigureById(curCell);
        }

        //взятие на проходе
        for(var i=0; i<curPossibleCells.length; i++)
        {
          if( curCell==curPossibleCells[i] && ( curPossibleCells[i]==possibleENPassants[0] || curPossibleCells[i]==possibleENPassants[1] ) )
          {
            if(curPlayer===0)
              delFigureById((+curCell[0]-1)+curCell[1]);
            else
              delFigureById((+curCell[0]+1)+curCell[1]);
          }
        }

        //превращение пешки
        if ( curFigure==="pawn" && ( ( curPlayer===0 && curCell[0]==8 ) || ( curPlayer===1 && curCell[0]==1 ) ) )
        {
          popUp(curCell);
          moveFigureFunc(ui.draggable.prop("id")[0], ui.draggable.prop("id")[1], curCell[0], curCell[1]);
          $(ui.helper).css("left","");
  			  $(ui.helper).css("top","");
          document.getElementById(ui.draggable.prop("id")).setAttribute("id",curCell);
          console.log(numToLetter(curPos[1]) + curPos[0] + " " + numToLetter(curCell[1]) + curCell[0]);
          //emit внутри функции popUp
        }
        else {
          //сохраняем текущее положение фигуры
          moveFigureFunc(ui.draggable.prop("id")[0], ui.draggable.prop("id")[1], curCell[0], curCell[1]);
          $(ui.helper).css("left","");
  			  $(ui.helper).css("top","");
          document.getElementById(ui.draggable.prop("id")).setAttribute("id",curCell);
          console.log(numToLetter(curPos[1]) + curPos[0] + " " + numToLetter(curCell[1]) + curCell[0]);
          socket.emit('turn_move', {from:{x:numToLetter(curPos[1]), y:curPos[0]}, to:{x:numToLetter(curCell[1]), y:curCell[0]}});
        }

        if($("#"+curCell).hasClass("hasFirstStep"))
        {
          $("#"+curCell).addClass("hasSecondStep");
          $("#"+curCell).addClass("hasNotFirstStep");
          $("#"+curCell).removeClass("hasFirstStep");
        }
        else {
          if($("#"+curCell).hasClass("hasSecondStep"))
          {
            $("#"+curCell).removeClass("hasSecondStep");
          }
        }
      }

      //showCommands();

      //меняем текущего игрока
      curPlayer=1-curPlayer;

      if(curPlayer===0)
        document.getElementById('turnmessage').innerHTML="White";
      else
        document.getElementById('turnmessage').innerHTML="Black";

      //проверка шаха
      checkShah();
      checkMat();
    }
    else{
      $(".figure").draggable( "option", "revert", true );
    }
  }
  }

  window.changeBoardFunc = function(x1, y1, x2, y2)
  {
    document.getElementById(x1.toString()+y1).setAttribute("id", x2.toString()+y2);

    if($("#"+x2.toString()+y2).hasClass("hasFirstStep"))
    {
      $("#"+x2.toString()+y2).removeClass("hasFirstStep");
      $("#"+x2.toString()+y2).addClass("hasSecondStep");
      $("#"+x2.toString()+y2).addClass("hasNotFirstStep");
    }
    else {
      if($("#"+x2.toString()+y2).hasClass("hasSecondStep"))
      {
        $("#"+x2.toString()+y2).removeClass("hasSecondStep");
      }
    }
  }

  window.moveFigureFunc = function(x1, y1, x2, y2)
  {
    document.getElementById('cell'+x2.toString()+y2).appendChild(document.getElementById('cell'+x1.toString()+y1).childNodes[1]);
  }

  window.checkENPassantFunc = function(x1, y1, x2, y2)
  {
    if (curPlayer==0 &&
      ((y2==(y1+1) && $("#" + x1.toString()+(y1+1)).hasClass("hasSecondStep")) ||
      ((y2==(y1-1)) && $("#" + x1.toString()+(y1-1)).hasClass("hasSecondStep"))) &&
      x2==6 )
    {
      if(y2===(y1+1))
        delFigureById(x1.toString()+y2);
      else
        delFigureById(x1.toString()+y2);
    }
    if (curPlayer==1 &&
      ((y2==(y1+1) && $("#" + x1.toString()+(y1+1)).hasClass("hasSecondStep")) ||
      ((y2==(y1-1)) && $("#" + x1.toString()+(y1-1)).hasClass("hasSecondStep"))) &&
      x2==3 )
    {
      if(y2===(y1+1))
        delFigureById(x1.toString()+y2);
      else
        delFigureById(x1.toString()+y2);
    }
  }

  window.letterToNum = function (letter)
  {
    if(letter==="a" || letter==="A")
      return 1;
    if(letter==="b" || letter==="B")
      return 2;
    if(letter==="c" || letter==="C")
      return 3;
    if(letter==="d" || letter==="D")
      return 4;
    if(letter==="e" || letter==="E")
      return 5;
    if(letter==="f" || letter==="F")
      return 6;
    if(letter==="g" || letter==="G")
      return 7;
    if(letter==="h" || letter==="H")
      return 8;
  }

  window.changePawn = function(curCell, newPiece)
  {
    if(newPiece=="bishop")
      newPiece="eleph";
    if(newPiece=="knight")
      newPiece="horse";
    $("#"+curCell).addClass(newPiece);
    $("#"+curCell).removeClass("pawn");
  }

  window.numToLetter = function (num)
  {
    if(num==1)
      return 'A';
    if(num==2)
      return 'B';
    if(num==3)
      return 'C';
    if(num==4)
      return 'D';
    if(num==5)
      return 'E';
    if(num==6)
      return 'F';
    if(num==7)
      return 'G';
    if(num==8)
      return 'H';


  }

  function popUp(curCell)
  {
    //показываем поп-ап
    $('body').append('<div id="blackout"></div>');
    var boxWidth = 310;
    var winWidth = $(window).width();
    var winHeight = $(document).height();
    var scrollPos = $(window).scrollTop();
    var disWidth = (winWidth - boxWidth) / 2
    var disHeight = scrollPos + 150;
    $('.popup-box').css({'width' : boxWidth+'px', 'left' : disWidth+'px', 'top' : disHeight+'px', display: 'block'});
    $('#blackout').css({'width' : winWidth+'px', 'height' : winHeight+'px', display: 'block'});

    if(curPlayer===0)
    {
      $("#magicqueen").css({"background-image" : "url(\"images/whitequeen.png\")"});
      $("#magiceleph").css({"background-image" : "url(\"images/whiteeleph.png\")"});
      $("#magichorse").css({"background-image" : "url(\"images/whitehorse.png\")"});
      $("#magicrook").css({"background-image" : "url(\"images/whiterook.png\")"});
    }
    else
    {
      $("#magicqueen").css({"background-image" : "url(\"images/blackqueen.png\")"});
      $("#magiceleph").css({"background-image" : "url(\"images/blackeleph.png\")"});
      $("#magichorse").css({"background-image" : "url(\"images/blackhorse.png\")"});
      $("#magicrook").css({"background-image" : "url(\"images/blackrook.png\")"});
    }

    $(".popup-box div").click(function() {
      //скрываем окно
        var scrollPos = $(window).scrollTop();
        $('.popup-box').hide();
        $('#blackout').hide();
        $("html,body").css("overflow","auto");
        $('html').scrollTop(scrollPos);
    });

    $('#magicqueen').click(function() {
        $("#"+curCell).removeClass("pawn");
        $("#"+curCell).addClass("queen");
        socket.emit('turn_promotion', {from:{x:numToLetter(curPos[1]), y:curPos[0]}, to:{x:numToLetter(curCell[1]), y:curCell[0]}, newPiece: "queen"});
    });
    $('#magiceleph').click(function() {
        $("#"+curCell).removeClass("pawn");
        $("#"+curCell).addClass("eleph");
        socket.emit('turn_promotion', {from:{x:numToLetter(curPos[1]), y:curPos[0]}, to:{x:numToLetter(curCell[1]), y:curCell[0]}, newPiece: "bishop"});
    });
    $('#magichorse').click(function() {
        $("#"+curCell).removeClass("pawn");
        $("#"+curCell).addClass("horse");
        socket.emit('turn_promotion', {from:{x:numToLetter(curPos[1]), y:curPos[0]}, to:{x:numToLetter(curCell[1]), y:curCell[0]}, newPiece: "knight"});
    });
    $('#magicrook').click(function() {
        $("#"+curCell).removeClass("pawn");
        $("#"+curCell).addClass("rook");
        socket.emit('turn_promotion', {from:{x:numToLetter(curPos[1]), y:curPos[0]}, to:{x:numToLetter(curCell[1]), y:curCell[0]}, newPiece: "rook"});
    });
  }


  function checkCastlingPossibility()
  {
    //рокировка
    //1. перетягиваем короля к Ладье+
    //2.1 Король+
    //2.2 и ладья должны ни разу не ходить (has first step?)+
    //3. один раз за игру+
    //4. короткая и длинная+
    //5. превращенная пешка не может делать рокировку
    //6. между ладьей и королем ничего не должно быть+
    if ( (curPlayer===0 && wasWhiteCastling) || (curPlayer===1 && wasBlackCastling))
      return null;
    possibleCastlingRooks=new Array();
    if(getCurFigure(document.getElementById(curPos))==="king" && $(document.getElementById(curPos)).hasClass("hasFirstStep"))
    {
      if (checkIdFreedom(curPos[0]+(+curPos[1]+1)) && checkIdFreedom(curPos[0]+(+curPos[1]+2)) &&
      getCurFigure(document.getElementById(curPos[0]+(+curPos[1]+3)))==="rook" &&
      $(document.getElementById(curPos[0]+(+curPos[1]+3))).hasClass("hasFirstStep"))
      {
        possibleCastlingRooks.push(document.getElementById(curPos[0]+(+curPos[1]+3)));
        return possibleCastlingRooks;
      }
      if (checkIdFreedom(curPos[0]+(+curPos[1]-1)) && checkIdFreedom(curPos[0]+(+curPos[1]-2)) &&
      checkIdFreedom(curPos[0]+(+curPos[1]-3)) &&
      getCurFigure(document.getElementById(curPos[0]+(+curPos[1]-4)))==="rook" &&
      $(document.getElementById(curPos[0]+(+curPos[1]-4))).hasClass("hasFirstStep"))
      {
        possibleCastlingRooks.push(document.getElementById(curPos[0]+(+curPos[1]-4)));
        return possibleCastlingRooks;
      }
    }
  }


  function castlingFunc(rookId)
  {
    if(rookId[1]==8)
    {
      moveFigureFunc(rookId[0], rookId[1], curPos[0], (+curPos[1]+1));
      moveFigureFunc(curPos[0], curPos[1], curPos[0], (+curPos[1]+2));
      document.getElementById(rookId).setAttribute("id", curPos[0]+(+curPos[1]+1));
      document.getElementById(curPos).setAttribute("id", curPos[0]+(+curPos[1]+2));
    }
    else {
      moveFigureFunc(rookId[0], rookId[1], curPos[0], (+curPos[1]-1));
      moveFigureFunc(curPos[0], curPos[1], curPos[0], (+curPos[1]-2));
      document.getElementById(rookId).setAttribute("id", curPos[0]+(+curPos[1]-1));
      document.getElementById(curPos).setAttribute("id", curPos[0]+(+curPos[1]-2));
    }
    if(curPlayer===0)
      wasWhiteCastling=true;
    else
      wasBlackCastling=true;
  }


  function checkIdFreedom(id)
  {
    for(var i=0; i<black.length; i++)
    {
      if(black[i].id===id)
        return false;
    }
    for(var i=0; i<white.length; i++)
    {
      if(white[i].id===id)
        return false;
    }
    return true;
  }


  function changeModel(newId)
  {
    var curCommand;
    if(curPlayer===0)
      curCommand=white;
    else
      curCommand=black;

    for(var i=0; i<curCommand.length; i++)
      if(curCommand[i].id===curPos)
      {
        curCommand[i].id=newId;
        i=100;
      }
  }


  window.delFigureById = function(id)
  {
    //удаление из списка
    if(curPlayer===0)
    {
      for(var i=0; i<black.length; i++)
       if($(black[i]).attr("id")===id)
         black.splice(i,1);
    }
    else
      for(var i=0; i<white.length; i++)
       if($(white[i]).attr("id")===id)
         white.splice(i,1);

    //лог
    var newLog = document.createElement('p');
    newLog.innerHTML = "Figure in cell " + id + " was taken!";
    //document.getElementById('logbox').appendChild(newLog);
    document.getElementById("logbox").insertBefore(newLog, document.getElementById("logbox").childNodes[0]);
    //удаление с доски
    document.getElementById(id).parentNode.removeChild(document.getElementById(id));
  }


  function checkCurCell(curCell)
  {
    for (var i=0; i<curPossibleCells.length; i++)
      if(curCell===curPossibleCells[i])
        return true;
    return false;
  }


  function checkCellFreedom(curCell)
  {
    //var newLog = document.createElement('p');
    //newLog.innerHTML ="curPlayer:" + curPlayer +" curCell: " + curCell;
    //document.getElementById('logbox').appendChild(newLog);
    for (var i=0; i<16; i++)
    {
      if ( ( black[i] && curPlayer===1 && black[i].id===curCell) || ( white[i] && curPlayer===0 && white[i].id===curCell) )
      return false;
    }
    return true;
  }


  window.checkEnemyCellFreedom = function(curCell)
  {

    for (var i=0; i<16; i++)
      if( ( black[i] && curPlayer==0 && black[i].id==curCell) || ( white[i] && curPlayer==1 && white[i].id==curCell) )
        return false;
      return true;
  }


  function checkRightPosition(curCell)
  {
    if(( curCell[0]>=1 && curCell[0]<=8 ) && ( curCell[1]>=1 && curCell[1]<=8 ) && curCell.length===2)
      return true;
    else
      return false;
  }


  function getCurFigure(curFigureElem)
  {
    if($(curFigureElem).hasClass("pawn"))
      return "pawn";
    if($(curFigureElem).hasClass("rook"))
      return "rook";
    if($(curFigureElem).hasClass("eleph"))
      return "eleph";
    if($(curFigureElem).hasClass("horse"))
      return "horse";
    if($(curFigureElem).hasClass("queen"))
      return "queen";
    if($(curFigureElem).hasClass("king"))
      return "king";
  }


  function showCommands()
  {
    var curBlack=" ";
    var curWhite=" ";
    for(var i=0; i<black.length; i++)
      curBlack=curBlack+" "+$(black[i]).attr("id");
    for(var i=0; i<white.length; i++)
      curWhite=curWhite+" "+$(white[i]).attr("id");
    var newLog = document.createElement('p');
    newLog.innerHTML = "white: " + curWhite;
    //document.getElementById('logbox').appendChild(newLog);
    document.getElementById("logbox").insertBefore(newLog, document.getElementById("logbox").childNodes[0]);
    var newLog = document.createElement('p');
    newLog.innerHTML = "black: " + curBlack;
    //document.getElementById('logbox').appendChild(newLog);
    document.getElementById("logbox").insertBefore(newLog, document.getElementById("logbox").childNodes[0]);
  }


  function checkShah()
  {

    //суть проверки:
    //проходим по possibleCells для каждой фигуры противника
    //если есть возможность съесть короля на следующем ходе, значит - шах
    var curCommand;
    if(curPlayer===0)
      curCommand=black;
    else
      curCommand=white;
    curPlayer=1-curPlayer; //меняем для корректной работы вспомогательных функций
    for(var i=0; i<curCommand.length; i++)
    {
      getPossibleCells(curCommand[i].id,
                                curCommand[i].id[0],
                                curCommand[i].id[1],
                                getCurFigure(curCommand[i]));
      var figurePossibleCells = globalPossibleCells;
      for(var j=0; j<globalPossibleCells.length; j++)
      {
        if(globalPossibleCells.length!=0 && !checkEnemyCellFreedom(globalPossibleCells[j]))
        {
          if(getCurFigure(document.getElementById(globalPossibleCells[j]))==="king")
          {
            shah = true;
            //shahThreat = $(curCommand[i]).attr("id");
            var newLog = document.createElement('p');
            newLog.innerHTML = "---------SHAH---------";
            //document.getElementById('logbox').appendChild(newLog);
            document.getElementById("logbox").insertBefore(newLog, document.getElementById("logbox").childNodes[0]);
            j=100;
            i=100;
          }
        }
      }
    }
    curPlayer=1-curPlayer;
  }


  window.checkMat = function()
  {
    //1.проходим по всем фигурам следующего игрока
    //2.берем possibleCells(другое имя) для каждой
    //3.проверяем каждую possibleCells каждой фигуры в checkConcreteCellShah и удаляем ходы, ведущие к шаху
    //4.если для каждой фигуры possible cells пуст, то дело пришло к мату
    var checkingCommand;
    if (curPlayer===0)
      checkingMatCommand=white;
    else
      checkingMatCommand=black;

    var isMat=true;
    for(var i=0; i<checkingMatCommand.length; i++)
    {
      var checkingMatPossibleCells=getPossibleCells(checkingMatCommand[i].id,checkingMatCommand[i].id[0],
        checkingMatCommand[i].id[1], getCurFigure(checkingMatCommand[i]));
      /*var newLog = document.createElement('p');
      newLog.innerHTML = checkingMatCommand[i].id + " " + getCurFigure(checkingMatCommand[i]);
      document.getElementById('logbox').appendChild(newLog);*/
      for (var j=0; j<checkingMatPossibleCells.length; j++)
      {
        if(checkConcreteCellShah(checkingMatCommand[i].id, checkingMatPossibleCells[j]))
        {
          checkingMatPossibleCells.splice(j,1);
          j=j-1;
        }
      }
      if (checkingMatPossibleCells.length>0)
      {
        isMat=false;
        //var newLog = document.createElement('p');
        //newLog.innerHTML="----------NO MAT :)----------";
        //document.getElementById('logbox').appendChild(newLog);
        //document.getElementById("logbox").insertBefore(newLog, document.getElementById("logbox").childNodes[0]);
        return false;
      }
    }
    if(isMat)
    {
      var newLog = document.createElement('p');
      newLog.innerHTML="----------MAT----------";
      //document.getElementById('logbox').appendChild(newLog);
      document.getElementById("logbox").insertBefore(newLog, document.getElementById("logbox").childNodes[0]);
      return true;
    }
  }


  function checkConcreteCellShah(oldId, possibleId)
  {

    //суть проверки:
    //передаем потенциальный ход
    //записываем его в black/white.id
    //проверяем на шах
    //изменяем обратно black/white
    //возвращем true, если будет шах
    var curCommand;
    var otherCommand;
    var changedI;
    if(curPlayer===0)
    {
      curCommand=black;
      otherCommand=white;
    }
    else
    {
      curCommand=white;
      otherCommand=black;
    }
    //подставляем шаг
    for(var i=0; i<otherCommand.length; i++)
    {
      if(otherCommand[i].id===oldId)
      {
        otherCommand[i].id=possibleId;
        i=100;
      }
    }
    curPlayer=1-curPlayer; //меняем для корректной работы вспомогательных функций
    for(var i=0; i<curCommand.length; i++)
    {
      getPossibleCells(curCommand[i].id,
                                curCommand[i].id[0],
                                curCommand[i].id[1],
                                getCurFigure(curCommand[i]));
      var figurePossibleCells = globalPossibleCells;
      for(var j=0; j<globalPossibleCells.length; j++)
      {
        if(globalPossibleCells.length!=0 && !checkEnemyCellFreedom(globalPossibleCells[j]))
        {
          if(getCurFigure(document.getElementById(globalPossibleCells[j]))==="king")
          {
            //проверка, можем ли мы скушать угрозу
            //если можем скушать, то не удаляем этот потенциальный ход
            if(curCommand[i].id===possibleId)
            {
              //otherCommand[changedI]=oldId;
              for(var i=0; i<otherCommand.length; i++)
              {
                if(otherCommand[i].id===possibleId)
                {
                  otherCommand[i].id=oldId;
                  i=100;
                }
              }
              curPlayer=1-curPlayer;
              return false;
            }

            j=100;
            i=100;

            //otherCommand[changedI]=oldId;
            for(var i=0; i<otherCommand.length; i++)
            {
              if(otherCommand[i].id===possibleId)
              {
                otherCommand[i].id=oldId;
                i=100;
              }
            }
            curPlayer=1-curPlayer;
            return true;
          }
        }
      }
    }
    curPlayer=1-curPlayer;
    for(var i=0; i<otherCommand.length; i++)
    {
      if(otherCommand[i].id===possibleId)
      {
        otherCommand[i].id=oldId;
        i=100;
      }
    }
  }


  function checkENPassant(possibleCells)
  {
    //если черный и на 5 ряду или белый и на 4 ряду
    //проходим по всем пешкам противника
    //если противник на 4 ряду для черного и 5 для белого + только что сделал ход
    //можно походить по горизонтали и скушать противника при этом
    if(curPlayer===0 && curPos!=null && curPos[0]==5)
    {
      checkEnemyPosForENPassant(5, possibleCells);
    }
    if(curPlayer===1 && curPos!=null && curPos[0]==4)
    {
      checkEnemyPosForENPassant(4, possibleCells);
    }
  }


  function checkEnemyPosForENPassant(checkingLine, possibleCells)
  {
    var enemy;
    if(curPlayer===0)
      enemy=black;
    else
      enemy=white;

    for (var i=0; i<enemy.length; i++)
    {
      if(enemy[i].id[0]==checkingLine && $("#"+enemy[i].id).hasClass("hasSecondStep"))
      {
        if(curPlayer===0)
          possibleCells.push((+enemy[i].id[0]+1).toString()+enemy[i].id[1])
        else
          possibleCells.push((+enemy[i].id[0]-1).toString()+enemy[i].id[1])
        possibleENPassants.push(possibleCells[possibleCells.length-1]);
      }
    }
  }


  function checkCellBeforePawn(id)
    {
      for (var i=0; i<16; i++)
      {
        if ( ( black[i] && curPlayer===0 && black[i].id===id) || ( white[i] && curPlayer===1 && white[i].id===id) )
        return false;
      }
      return true;
    }


// ПОЛУЧЕНИЕ ВОЗМОЖНЫХ ХОДОВ
  function getPossibleCells(curPos,curNumber,curLetter,curFigure)
  {
    var possibleCells = new Array();

    //------------------------PAWN------------------------
    if(curFigure==="pawn")
    {
      if( $("#"+curPos).hasClass("hasFirstStep") )
      {
        if(curPlayer==0)
        {
          if(checkCellBeforePawn((+curNumber+1)+curLetter))
          {
            possibleCells[0]=(+curNumber+1)+curLetter;
            possibleCells[1]=(+curNumber+2)+curLetter;
          }
        }
        else {
          if(checkCellBeforePawn((+curNumber-1)+curLetter))
          {
            possibleCells[0]=(+curNumber-1)+curLetter;
            possibleCells[1]=(+curNumber-2)+curLetter;
          }
        }
      }
      if( $("#"+curPos).hasClass("hasNotFirstStep") )
      {
        if(curPlayer==0)
          possibleCells[0]=(+curNumber+1)+curLetter;
        else
          possibleCells[0]=(+curNumber-1)+curLetter;
      }

      //проверяем, не стоят ли другие фигуры на ячейках, в которые потенциально можно походить
      for (var i=0; i<possibleCells.length; i++)
      {
        if (!checkCellFreedom(possibleCells[i]) || (!checkEnemyCellFreedom(possibleCells[i])))
          possibleCells.splice(i,1);
      }

      //если есть, кого съесть
      if(curPlayer===0)
      {
        if(!checkEnemyCellFreedom((+curNumber+1).toString()+(+curLetter+1)))
          possibleCells.push((+curNumber+1).toString()+(+curLetter+1));
        if(!checkEnemyCellFreedom((+curNumber+1).toString()+(+curLetter-1)))
          possibleCells.push((+curNumber+1).toString()+(+curLetter-1));
      }
      else {
        if(!checkEnemyCellFreedom((+curNumber-1).toString()+(+curLetter+1)))
          possibleCells.push((+curNumber-1).toString()+(+curLetter+1));
        if(!checkEnemyCellFreedom((+curNumber-1).toString()+(+curLetter-1)))
          possibleCells.push((+curNumber-1).toString()+(+curLetter-1));
      }

      //проверяем на возможность сделать взятие на проходе и добавляем ходы
      checkENPassant(possibleCells);
    }

    //------------------------ROOK------------------------
    if(curFigure==="rook")
    {
      //ходы по вертикали
      //before curNumber
      for (var i=+curNumber-1; i>=1; i--)
      {
        if ( checkCellFreedom(i+curLetter) )
          if ( !checkEnemyCellFreedom(i+curLetter) )
          {
            possibleCells.push(i+curLetter);
            i=0;
          }
          else
            possibleCells.push(i+curLetter);
        else
          i=0;
      }
      //after curNumber
      for (var i=+curNumber+1; i<=8; i++)
      {
        if ( checkCellFreedom(i+curLetter) )
          if ( !checkEnemyCellFreedom(i+curLetter) )
          {
            possibleCells.push(i+curLetter);
            i=9;
          }
          else
            possibleCells.push(i+curLetter);
        else
          i=9;
      }
      //ходы по горизонтали
      //before curLetter
      for (var i=+curLetter-1; i>=1; i--)
      {
        if ( checkCellFreedom(curNumber+i) )
          if ( !checkEnemyCellFreedom(curNumber+i) )
          {
            possibleCells.push(curNumber+i);
            i=0;
          }
          else
            possibleCells.push(curNumber+i);
        else
          i=0;
      }
      //after curLetter
      for (var i=+curLetter+1; i<=8; i++)
      {
        if ( checkCellFreedom(curNumber+i) )
          if ( !checkEnemyCellFreedom(curNumber+i) )
          {
            possibleCells.push(curNumber+i);
            i=9;
          }
          else
            possibleCells.push(curNumber+i);
        else
          i=9;
      }
    }

    //------------------------ELEPH------------------------
    if(curFigure==="eleph")
    {
      //ходы по left->right
      //before curNumber
      var i=+curNumber-1;
      var j=+curLetter-1;
      while (i>=1 && j>=1) {
        if ( checkCellFreedom(i+j.toString()) )
          if( !checkEnemyCellFreedom(i+j.toString()) )
          {
              possibleCells.push(i+j.toString());
              i=0;
          }
          else
            possibleCells.push(i+j.toString());
        else
          i=0;
        i=i-1;
        j=j-1;
      }
      //after curNumber
      i=+curNumber+1;
      j=+curLetter+1;
      while (i<=8 && j<=8) {
        if ( checkCellFreedom(i+j.toString()) )
          if( !checkEnemyCellFreedom(i+j.toString()) )
          {
              possibleCells.push(i+j.toString());
              i=9;
          }
          else
            possibleCells.push(i+j.toString());
        else
          i=9;
        i=i+1;
        j=j+1;
      }
      //ходы right->left
      i=+curNumber-1;
      j=+curLetter+1;
      while (i>=1 && j<=8) {
        if ( checkCellFreedom(i+j.toString()) )
          if( !checkEnemyCellFreedom(i+j.toString()) )
          {
              possibleCells.push(i+j.toString());
              i=0;
          }
          else
            possibleCells.push(i+j.toString());
        else
          i=0;
        i=i-1;
        j=j+1;
      }
      //after curNumber
      i=+curNumber+1;
      j=+curLetter-1;
      while (i<=8 && j>=1) {
        if ( checkCellFreedom(i+j.toString()) )
          if( !checkEnemyCellFreedom(i+j.toString()) )
          {
              possibleCells.push(i+j.toString());
              i=9;
          }
          else
            possibleCells.push(i+j.toString());
        else
          i=9;
        i=i+1;
        j=j-1;
      }
    }

    //------------------------ELEPH------------------------
    if(curFigure==="horse")
    {
      var prePossibleCells = new Array();
      prePossibleCells[0]=(+curNumber+2).toString()+(+curLetter-1);
      prePossibleCells[1]=(+curNumber+2).toString()+(+curLetter+1);
      prePossibleCells[2]=(+curNumber+1).toString()+(+curLetter+2);
      prePossibleCells[3]=(+curNumber-1).toString()+(+curLetter+2);
      prePossibleCells[4]=(+curNumber-2).toString()+(+curLetter-1);
      prePossibleCells[5]=(+curNumber-2).toString()+(+curLetter+1);
      prePossibleCells[6]=(+curNumber+1).toString()+(+curLetter-2);
      prePossibleCells[7]=(+curNumber-1).toString()+(+curLetter-2);
      for(var i=0; i<prePossibleCells.length; i++)
      {
        if ( checkCellFreedom(prePossibleCells[i]) && checkRightPosition(prePossibleCells[i]) )
          possibleCells.push(prePossibleCells[i]);
      }
    }

    //------------------------QUEEN------------------------
    if(curFigure==="queen")
    {
      //ходы по left->right
      //before curNumber
      var i=+curNumber-1;
      var j=+curLetter-1;
      while (i>=1 && j>=1) {
        if ( checkCellFreedom(i+j.toString()) )
          if( !checkEnemyCellFreedom(i+j.toString()) )
          {
              possibleCells.push(i+j.toString());
              i=0;
          }
          else
            possibleCells.push(i+j.toString());
        else
          i=0;
        i=i-1;
        j=j-1;
      }
      //after curNumber
      i=+curNumber+1;
      j=+curLetter+1;
      while (i<=8 && j<=8) {
        if ( checkCellFreedom(i.toString()+j) )
          if( !checkEnemyCellFreedom(i+j.toString()) )
          {
              possibleCells.push(i+j.toString());
              i=9;
          }
          else
            possibleCells.push(i+j.toString());
        else
          i=9;
        i=i+1;
        j=j+1;
      }
      //ходы right->left
      i=+curNumber-1;
      j=+curLetter+1;
      while (i>=1 && j<=8) {
        if ( checkCellFreedom(i+j.toString()) )
          if( !checkEnemyCellFreedom(i+j.toString()) )
          {
              possibleCells.push(i+j.toString());
              i=0;
          }
          else
            possibleCells.push(i+j.toString());
        else
          i=0;
        i=i-1;
        j=j+1;
      }
      //after curNumber
      i=+curNumber+1;
      j=+curLetter-1;
      while (i<=8 && j>=1) {
        if ( checkCellFreedom(i.toString()+j) )
          if( !checkEnemyCellFreedom(i+j.toString()) )
          {
              possibleCells.push(i+j.toString());
              i=9;
          }
          else
            possibleCells.push(i+j.toString());
        else
          i=9;
        i=i+1;
        j=j-1;
      }
      //ходы по вертикали
      //before curNumber
      for (var i=+curNumber-1; i>=1; i--)
      {
        if ( checkCellFreedom(i+curLetter) )
          if ( !checkEnemyCellFreedom(i+curLetter) )
          {
            possibleCells.push(i+curLetter);
            i=0;
          }
          else
            possibleCells.push(i+curLetter);
        else
          i=0;
      }
      //after curNumber
      for (var i=+curNumber+1; i<=8; i++)
      {
        if ( checkCellFreedom(i+curLetter) )
          if ( !checkEnemyCellFreedom(i+curLetter) )
          {
            possibleCells.push(i+curLetter);
            i=9;
          }
          else
            possibleCells.push(i+curLetter);
        else
          i=9;
      }
      //ходы по горизонтали
      //before curLetter
      for (var i=+curLetter-1; i>=1; i--)
      {
        if ( checkCellFreedom(curNumber+i) )
          if ( !checkEnemyCellFreedom(curNumber+i) )
          {
            possibleCells.push(curNumber+i);
            i=0;
          }
          else
            possibleCells.push(curNumber+i);
        else
          i=0;
      }
      //after curLetter
      for (var i=+curLetter+1; i<=8; i++)
      {
        if ( checkCellFreedom(curNumber+i) )
          if ( !checkEnemyCellFreedom(curNumber+i) )
          {
            possibleCells.push(curNumber+i);
            i=9;
          }
          else
            possibleCells.push(curNumber+i);
        else
          i=9;
      }
    }

    //------------------------KING------------------------
    if(curFigure==="king")
    {
      var prePossibleCells = new Array();
      prePossibleCells[0]=(+curNumber+1)+curLetter;
      prePossibleCells[1]=(+curNumber-1)+curLetter;
      prePossibleCells[2]=(+curNumber+1).toString()+(+curLetter+1);
      prePossibleCells[3]=(+curNumber+1).toString()+(+curLetter-1);
      prePossibleCells[4]=(+curNumber-1).toString()+(+curLetter+1);
      prePossibleCells[5]=(+curNumber-1).toString()+(+curLetter-1);
      prePossibleCells[6]=curNumber+(+curLetter-1);
      prePossibleCells[7]=curNumber+(+curLetter+1);
      for(var i=0; i<prePossibleCells.length; i++)
      {
        if ( checkCellFreedom(prePossibleCells[i]) && checkRightPosition(prePossibleCells[i]) )
          possibleCells.push(prePossibleCells[i]);
      }
    }

    for (var i=0; i<possibleCells.length; i++)
      if(!checkRightPosition(possibleCells[i]))
        possibleCells.splice(i,1);

    globalPossibleCells=possibleCells;
    return possibleCells;
  }


});
