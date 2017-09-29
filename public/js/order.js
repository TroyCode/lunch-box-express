var menu = ['龍哥控肉飯','2','3','4','5'];
var price = ['1','2','3','4','5'];

var kind_list=['rice','noddle','other'];
$("<h5/>", {
    "text":"日期："
}).appendTo('.main_body');
$("<h5/>", {
    "text":"店家名稱："
}).appendTo('.main_body');
$("<h5/>", {
    "text":"結束時間："
}).appendTo('.main_body');
$("<h5/>", {
        "id":'menu_div',
        "text":"可訂購選項："
    }).appendTo('.main_body');
    $("<h4/>", {
        "id":'price_div',
        "text":"價格："
    }).appendTo('.main_body');
    $("<h4/>", {
        "id":'count_div',
        "text":"數量："
    }).appendTo('.main_body');
    for(var i=0;i<kind_list.length;i++){
        $("<span/>", {
            "class":'kind_div',
            "id":i,
            "text":kind_list[i]
        }).appendTo('#menu_div');
    }
    $("<div/>", {
        "class":"order_div"
      }).appendTo('.main_body');


$(function(){
    $(".kind_div").click(function(){
        $('.order_div').empty();  

        for(var i=0;i<menu.length;i++){
            var body_id ='body_id'+i;
            $("<span/>", {
                "id":'menu'+i,
                "text":menu[i]+"=>"
              }).appendTo('.order_div');
            $("<span/>", {
                "id":'price'+i,
                "text":'價格：$'+price[i]
              }).appendTo('.order_div');
            $("<input/>", {
                "type":"number",
                "min":0,
                "max":20,
                "style":"display:inline"
            }).appendTo('#price'+i);
            $("<p/>", {
            }).appendTo('#price'+i);

        }
    });
    

});

