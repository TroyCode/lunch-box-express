var title=['店名1超長超無趣超無聊沒人買邊緣人摳憐喔','2'];
var time_start=['7:30','6:30'];
var time_end=['10:30','13:30'];
var rank =["01"];
var list = [];
var toplist=[];
for(var i=0;i<title.length;i++){
    list[i]=[];
    list[i][0]=time_end[i].split(':')[0];//排序用
    list[i][1]=title[i];
    list[i][2]=time_end[i];
}
list=list.sort();
    for(var i=0;i<title.length;i++){
        var body_id = 'bodydiv_'+i;
        $("<div/>", {
            "class": "body_div",
            "id":body_id,
        }).appendTo(".main_body");
        $("<p/>", {
            "id":'title'+i,
            "text":'店名: '+list[i][1]
          }).appendTo('#bodydiv_'+i);
        $("<h5/>", {
            "id":'time'+i,
            "text":'截止時間: '+list[i][2]
          }).appendTo('#bodydiv_'+i);
        $("<a/>", {
            "id":'item'+i,
            "class":"item",
            "text":'詳情.... '
          }).appendTo('#bodydiv_'+i);
    }

$(function(){
    $(".body_div").click(function(click_id){
        var i = this.id;
        i=i.split('_');
        i=i[1];
        var url='/order';
        $.ajax({
            url:'/order',
            type:'GET',
            data:{
                id:i+'',
                name:title[i]+''
            },
            success:function(url){
                $('.main_body').html(url);
            }
        });
         return false;
     });

});