$(document).ready(function(){

  //информация о текущем ходе
  var curPlayer = 0; //0-white, 1-black
  var curColor = null;
  var curFigure = null;
  var curPos = null;
  var curNumber = null;
  var curLetter = null;
  var curPossibleCells = null;
  var shah = false;
  var shahThreat = null;
  var killer = null;
  //создаем сообщение о текущем игроке
  var turnMessage = document.createElement('div');
  turnMessage.setAttribute('id','turnmessage');
  turnMessage.innerHTML="White";
  document.body.appendChild(turnMessage);
  //логи ходов
  var logBox = document.createElement('div');
  logBox.setAttribute('id','logbox');
  document.body.appendChild(logBox);


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

    //очередность ходов
    if(!shah)
    {
      if(((curPlayer===0 && curColor==="black") || (curPlayer===1 && curColor==="white")))
      {
        $(".figure").draggable( "option", "revert", true );
      }
      else {
        $(".figure").draggable( "option", "revert", false );
        //определение потенциально возможных ходов
        curPossibleCells = getPossibleCells(curPos,curNumber,curLetter,curFigure);
        //закрашиваем ячейки
        for (var i=0; i<curPossibleCells.length; i++)
          $(document.getElementById("cell"+curPossibleCells[i])).addClass("possiblecell");
      }
    }

    if(shah)
    {
      if(((curPlayer===0 && curColor==="black") || (curPlayer===1 && curColor==="white")))
      {
        $(".figure").draggable( "option", "revert", true );
      }
      else {
        $(".figure").draggable( "option", "revert", false );
        //если случился шах, то имеются три варианта развития событий:
        //1)если есть возможность взять фигуру, угрожающую королю, то запрещаются
        //все другие действия кроме этого взятия
        //2)если есть возможность прикрыть короля или уйти королем от атаки,
        //то эти ходы предлагаются игроку
        //3)если атаки не избежать, то это мат
        var newLog = document.createElement('p');
        newLog.innerHTML = "killer: " + killer + " " + $(event.target).attr("id");
        document.getElementById('logbox').appendChild(newLog);
        if ($(event.target).attr("id")!=killer)
        {
          $(".figure").draggable( "option", "revert", true );
          var newLog = document.createElement('p');
          newLog.innerHTML = "you should kill threat";
          document.getElementById('logbox').appendChild(newLog);
        }
        else{
          $(".figure").draggable( "option", "revert", false );
          curPossibleCells.push(shahThreat);
        }
      }
    }
  }


  function handleDropEvent(event,ui)
  {
    var curCell = $(event.target).attr("id").substr(4,2);

    //отмена подсвечивания возможных ходов
    if (curPossibleCells!=null)
      for (var i=0; i<curPossibleCells.length; i++)
        $(document.getElementById("cell"+curPossibleCells[i])).removeClass("possiblecell");

    if (curPossibleCells!=null && checkCurCell(curCell))
    {
      $(".figure").draggable( "option", "revert", false );

      //пишем лог
      var newLog = document.createElement('p');
      newLog.innerHTML = curColor + " " + curFigure + " " + curPos + " - " + curCell;
      document.getElementById('logbox').appendChild(newLog);

      //взятие
      if(!checkEnemyCellFreedom(curCell))
      {
        //удаляем фигуру
        delFigureById(curCell);
      }

      //сохраняем текущее положение фигуры
      document.getElementById(ui.draggable.prop("id")).setAttribute("id",curCell);
      $("#"+curCell).removeClass("hasFirstStep");
      $("#"+curCell).addClass("hasNotFirstStep");

      showCommands();

      //проверка шаха
      checkShah();

      //меняем текущего игрока
      curPlayer=1-curPlayer;
      if(curPlayer===0)
        document.getElementById('turnmessage').innerHTML="White";
      else
        document.getElementById('turnmessage').innerHTML="Black";

      if(shah)
        shahSituation();
    }
    else{
      $(".figure").draggable( "option", "revert", true );
    }
  }


  function delFigureById(id)
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
    document.getElementById('logbox').appendChild(newLog);
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
    for (var i=0; i<16; i++)
      if( ( curPlayer===1 && $(black[i]).attr("id")===curCell) || ( curPlayer===0 && $(white[i]).attr("id")===curCell) )
        return false;
    return true;
  }


  function checkEnemyCellFreedom(curCell)
  {
    for (var i=0; i<16; i++)
      if( ( curPlayer===0 && $(black[i]).attr("id")===curCell) || ( curPlayer===1 && $(white[i]).attr("id")===curCell) )
        return false;
      return true;
  }

  function checkRightPosition(curCell)
  {
    if(( curCell[0]>=1 && curCell[0]<=8 ) && ( curCell[1]>=1 && curCell[1]<=8 ))
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
          possibleCells[0]=(+curNumber+1)+curLetter;
          possibleCells[1]=(+curNumber+2)+curLetter;
        }
        else {
          possibleCells[0]=(+curNumber-1)+curLetter;
          possibleCells[1]=(+curNumber-2)+curLetter;
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
            i=0;
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
            i=0;
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
              i=0;
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
              i=0;
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
              i=0;
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
              i=0;
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
            i=0;
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
            i=0;
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
    return possibleCells;
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
    document.getElementById('logbox').appendChild(newLog);
    var newLog = document.createElement('p');
    newLog.innerHTML = "black: " + curBlack;
    document.getElementById('logbox').appendChild(newLog);
  }


  function checkShah()
  {
    //проходим по possibleCells для каждой фигуры
    //если есть возможность съесть короля на следующем ходе, значит - шах
    var curCommand;
    if(curPlayer===0)
      curCommand=white;
    else
      curCommand=black;

    for(var i=0; i<curCommand.length; i++)
    {
      var figurePossibleCells = getPossibleCells($(curCommand[i]).attr("id"),
                                $(curCommand[i]).attr("id")[0],
                                $(curCommand[i]).attr("id")[1],
                                getCurFigure(curCommand[i]));
      for(var j=0; j<figurePossibleCells.length; j++)
      {
        if(!checkEnemyCellFreedom(figurePossibleCells[j]))
        {
          if(getCurFigure(document.getElementById(figurePossibleCells[j]))==="king")
          {
            shah = true;
            shahThreat = $(curCommand[i]).attr("id");
            var newLog = document.createElement('p');
            newLog.innerHTML = "---------SHAH---------";
            document.getElementById('logbox').appendChild(newLog);
            j=100;
            i=100;
          }
        }
      }
    }
  }


  function shahSituation()
  {
    //проверяем, можно ли съесть угрозу
    var curCommand;
    if(curPlayer===0)
      curCommand=white;
    else
    curCommand=black;

    for(var i=0; i<curCommand.length; i++)
    {
      var figurePossibleCells = getPossibleCells($(curCommand[i]).attr("id"),
                                $(curCommand[i]).attr("id")[0],
                                $(curCommand[i]).attr("id")[1],
                                getCurFigure(curCommand[i]));
      for(var j=0; j<figurePossibleCells.length; j++)
      {
        if(!checkEnemyCellFreedom(figurePossibleCells[j]))
        {
          if(figurePossibleCells[j]===shahThreat)
          {
            killer=$(curCommand[i]).attr("id");
            var newLog = document.createElement('p');
            newLog.innerHTML = "YOU CAN KILL " + getCurFigure(document.getElementById(figurePossibleCells[j]))
            + figurePossibleCells[j] + " with killer" + killer;
            document.getElementById('logbox').appendChild(newLog);
            $(document.getElementById("cell"+shahThreat)).addClass("threatCell");
          }
        }
      }
    }

    //запрещаем другие действия и предлагаем съесть угрозу
    //потестить этот вариант развития событий и шаги

    //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    //переписать шах-проверку для конкретной фигуры без перебора всей команды - он лишний
    //дописать развитие событий для нескольких киллеров

    //ищем возможные шаги для короля
    //проверяем их на ситуацию шаха

    //ищем возможные шаги, чтоб спрятать короля
  }

});
