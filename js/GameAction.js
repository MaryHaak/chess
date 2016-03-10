$(document).ready(function(){

  //информация о текущем ходе
  var curPlayer = 0; //0-white, 1-black
  var curColor = null;
  var curFigure = null;
  var curPos = null;
  var curNumber = null;
  var curLetter = null;
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

  function handleDragStart(event,ui){

    if($(event.target).hasClass("whitefigure"))
      curColor = "white"
    else
      curColor = "black";

    //ОЧЕРЕДНОСТЬ ХОДОВ
    if( (curPlayer===0 && curColor==="black") || (curPlayer===1 && curColor==="white") )
		{
      $(".figure").draggable( "option", "revert", true );
      exit();
		}
    else{
      $(".figure").draggable( "option", "revert", false );
    }

    if($(event.target).hasClass("pawn"))
      curFigure = "pawn";
    curPos = $(event.target).attr("id");
    curNumber = $(event.target).attr("id")[0];
    curLetter = $(event.target).attr("id")[1];


    //PAWN - последующие ходы
    //!!!!!!!!!!!!!крайние значения?
    if(curFigure === "pawn" && $("#"+curPos).hasClass("hasFirstStep"))
    {
      if(curPlayer==0)
      {
        $(document.getElementById("cell"+(+curNumber+1)+curLetter)).addClass("possiblecell");
        $(document.getElementById("cell"+(+curNumber+2)+curLetter)).addClass("possiblecell");
      }
      else {
        $(document.getElementById("cell"+(+curNumber-1)+curLetter)).addClass("possiblecell");
        $(document.getElementById("cell"+(+curNumber-2)+curLetter)).addClass("possiblecell");
      }
    }
    if(curFigure === "pawn" && $("#"+curPos).hasClass("hasNotFirstStep"))
    {
      if(curPlayer==0)
      {
        $(document.getElementById("cell"+(+curNumber+1)+(+curLetter+1))).addClass("possiblecell");
        $(document.getElementById("cell"+(+curNumber+1)+(+curLetter-1))).addClass("possiblecell");
      }
      else {
        $(document.getElementById("cell"+(+curNumber-1)+(+curLetter+1))).addClass("possiblecell");
        $(document.getElementById("cell"+(+curNumber-1)+(+curLetter-1))).addClass("possiblecell");
      }
    }

  }

  function handleDropEvent(event,ui)
  {
    var curCell = $(event.target).attr("id").substr(4,2);

    //отмена подсвечивания возможных ходов
    //pawn - первый шаг
    if(curPlayer==0 && $("#"+curPos).hasClass("hasFirstStep"))
    {
      $(document.getElementById("cell"+(+curNumber+1)+curLetter)).removeClass("possiblecell");
      $(document.getElementById("cell"+(+curNumber+2)+curLetter)).removeClass("possiblecell");
    }
    else {
      $(document.getElementById("cell"+(+curNumber-1)+curLetter)).removeClass("possiblecell");
      $(document.getElementById("cell"+(+curNumber-2)+curLetter)).removeClass("possiblecell");
    }
    //pawn - последующие шаги
    if(curPlayer==0 && $("#"+curPos).hasClass("hasNotFirstStep"))
    {
      $(document.getElementById("cell"+(+curNumber+1)+(+curLetter+1))).removeClass("possiblecell");
      $(document.getElementById("cell"+(+curNumber+1)+(+curLetter-1))).removeClass("possiblecell");
    }
    else {
      $(document.getElementById("cell"+(+curNumber-1)+(+curLetter+1))).removeClass("possiblecell");
      $(document.getElementById("cell"+(+curNumber-1)+(+curLetter-1))).removeClass("possiblecell");
    }

    if ( ( ( ( ( ( (+curNumber+1)+curLetter===curCell ||
                (+curNumber+2)+curLetter===curCell ) &&
                curPlayer==0 ) ||
            ( ( (+curNumber-1)+curLetter===curCell ||
                (+curNumber-2)+curLetter===curCell ) &&
                curPlayer==1 ) ) &&
                $("#"+curPos).hasClass("hasFirstStep") )
                ||
        ( ( ( ( (+curNumber+1).toString()+(+curLetter+1).toString()===curCell ||
                (+curNumber+1).toString()+(+curLetter-1).toString()===curCell ) &&
                curPlayer==0 ) ||
            (  ( (+curNumber-1).toString()+(+curLetter+1).toString()===curCell ||
                (+curNumber-1).toString()+(+curLetter-1).toString()===curCell ) &&
                curPlayer==1 ) ) &&
                $("#"+curPos).hasClass("hasNotFirstStep") )
      ) && checkCellFreedom(curCell)===true )
    {
      $(".figure").draggable( "option", "revert", false );

      //пишем лог
      var newLog = document.createElement('p');
      newLog.innerHTML = curColor + " " + curFigure + " " + curPos + " - " + curCell;
      document.getElementById('logbox').appendChild(newLog);

      //сохраняем текущее положение фигуры
      document.getElementById(ui.draggable.prop("id")).setAttribute("id",curCell);
      $("#"+curCell).removeClass("hasFirstStep");
      $("#"+curCell).addClass("hasNotFirstStep");

      curPlayer=1-curPlayer;
      if(curPlayer===0)
        document.getElementById('turnmessage').innerHTML="White";
      else
        document.getElementById('turnmessage').innerHTML="Black";
    }
    else{
      $(".figure").draggable( "option", "revert", true );
    }
  }

  function checkCellFreedom(curCell)
  {
    var checkRes = true;
    for (var i=0; i<16; i++)
    {
      if($(black[i]).attr("id")===curCell || $(white[i]).attr("id")===curCell)
        checkRes = false;
    }
    return checkRes;
  }  
});
