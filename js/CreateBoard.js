$(document).ready(function(){

  //создаем доску
  var board = document.createElement('div');
  board.setAttribute('id',"board");
  document.body.appendChild(board);

  //заполяем поле клетками
  var cells = new Array();
  var color=true;
  for(var i=8; i!=0; i--){
    cells[i] = new Array();
    for(var j=1; j<=8; j++){
      cells[i][j] = document.createElement('div');
      if(color)
        cells[i][j].setAttribute('class',"cell whitecell")
      else
        cells[i][j].setAttribute('class',"cell blackcell");
      if(j!=8)
        color = !color;
      cells[i][j].setAttribute('id','cell'+i.toString()+j.toString());
      document.getElementById('board').appendChild(cells[i][j]);
      var cellIndex = document.createElement("p");
      cellIndex.innerHTML = i + " " + j;
      cellIndex.setAttribute('class',"index");
      document.getElementById('cell'+i.toString()+j.toString()).appendChild(cellIndex);
    }
  }

  //расставляем фигуры
  //создаем два массива div-ов - команды
  //задаем:
  //класс - тип фигуры (исп. в правилах ходов)
  //класс - цвет команды (исп. для реалтзации очередности ходов)
  //id - для задания текущего положения(соотносим с клеткой)
  window.white = new Array();
  window.black = new Array();
  for (var i=0; i<16; i++)
  {
    white[i] = document.createElement('div');
    black[i] = document.createElement('div');
  }
  black[0].setAttribute('class','figure blackfigure rook hasFirstStep');
  document.getElementById('cell81').appendChild(black[0]);
  black[0].setAttribute('id','81');
  black[0].id="81";
  black[7].setAttribute('class','figure blackfigure rook hasFirstStep');
  document.getElementById('cell88').appendChild(black[7]);
  black[7].setAttribute('id','88');
  black[7].id="88";
  white[0].setAttribute('class','figure whitefigure rook hasFirstStep');
  document.getElementById('cell11').appendChild(white[0]);
  white[0].setAttribute('id','11');
  white[0].id="11"
  white[7].setAttribute('class','figure whitefigure rook hasFirstStep');
  document.getElementById('cell18').appendChild(white[7]);
  white[7].setAttribute('id','18');
  white[7].id="18";

  black[1].setAttribute('class','figure blackfigure horse');
  document.getElementById('cell82').appendChild(black[1]);
  black[1].setAttribute('id','82');
  black[1].id="82";
  black[6].setAttribute('class','figure blackfigure horse');
  document.getElementById('cell87').appendChild(black[6]);
  black[6].setAttribute('id','87');
  black[6].id="87";
  white[1].setAttribute('class','figure whitefigure horse');
  document.getElementById('cell12').appendChild(white[1]);
  white[1].setAttribute('id','12');
  white[1].id="12";
  white[6].setAttribute('class','figure whitefigure horse');
  document.getElementById('cell17').appendChild(white[6]);
  white[6].setAttribute('id','17');
  white[6].id="17";

  black[2].setAttribute('class','figure blackfigure eleph');
  document.getElementById('cell83').appendChild(black[2]);
  black[2].setAttribute('id','83');
  black[2].id="83";
  black[5].setAttribute('class','figure blackfigure eleph');
  document.getElementById('cell86').appendChild(black[5]);
  black[5].setAttribute('id','86');
  black[5].id="86";
  white[2].setAttribute('class','figure whitefigure eleph');
  document.getElementById('cell13').appendChild(white[2]);
  white[2].setAttribute('id','13');
  white[2].id="13";
  white[5].setAttribute('class','figure whitefigure eleph');
  document.getElementById('cell16').appendChild(white[5]);
  white[5].setAttribute('id','16');
  white[5].id="16";

  black[3].setAttribute('class','figure blackfigure queen');
  document.getElementById('cell84').appendChild(black[3]);
  black[3].setAttribute('id','84');
  black[3].id="84";
  black[4].setAttribute('class','figure blackfigure king hasFirstStep');
  document.getElementById('cell85').appendChild(black[4]);
  black[4].setAttribute('id','85');
  black[4].id="85";
  white[3].setAttribute('class','figure whitefigure queen');
  document.getElementById('cell14').appendChild(white[3]);
  white[3].setAttribute('id','14');
  white[3].id="14";
  white[4].setAttribute('class','figure whitefigure king hasFirstStep');
  document.getElementById('cell15').appendChild(white[4]);
  white[4].setAttribute('id','15');
  white[4].id="15";

  for (var i=0; i<8; i++)
  {
    black[8+i].setAttribute('class','figure blackfigure pawn hasFirstStep');
    document.getElementById('cell'+'7'+(i+1)).appendChild(black[8+i]);
    black[8+i].setAttribute('id','7'+(i+1));
    black[8+i].id="7"+(i+1);
    white[8+i].setAttribute('class','figure whitefigure pawn hasFirstStep');
    document.getElementById('cell'+'2'+(i+1)).appendChild(white[8+i]);
    white[8+i].setAttribute('id','2'+(i+1));
    white[8+i].id="2"+(i+1);
  }

});
