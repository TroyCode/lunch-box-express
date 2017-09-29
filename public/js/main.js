var toplist=[];
var text = JSON.parse('main');
for(var i=0;i<title.length;i++){
    toplist[i]=[];
    toplist[i][0]=rank[i]+'';//排序用
    toplist[i][1]=title[i];
}
toplist=toplist.sort();

    for(i=0;i<3;i++){
        $("<span/>", {
            "id":'top'+i,
            "text":'TOP'+(i)+': '+toplist[i],
            "class":"top_text"
          }).appendTo('.bottom_menu');
        }

        


