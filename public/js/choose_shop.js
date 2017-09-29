var shop_list=['麥當勞'];
for(var i=0;i<shop_list.length;i++){
$("<div/>", {
    "class": "body_div",
    "id":shop_list[i],
    "text":'店名：'+shop_list[i],
    "name":shop_list[i]
}).appendTo(".main_body");
}

$('.body_div').click(function(){
    var clicknum=name;
       $.ajax({
           url:'/menu_details',
           type:'GET',
           success:function(url){
               $('.main_body').html(url);
           }
       });
        return false;
    });