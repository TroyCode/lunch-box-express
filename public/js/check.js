function check_price_num(need_ckeck){
    var price_check = /^[0-9]+$/
    return price_check.test(need_ckeck);
}
function check_phone_num(phone_num){
    let phone_check=/^[0-9]{2}-[0-9]{8}$/;
    return (phone_check.test(phone_num))
}
function phone_up_key(num){
    var num_check = /[0-9]{2}/
    if(num.length==2 && num_check.test(num)==true){
        document.getElementById('shop_phone').value=num+'-'
    }
}

//檢查 中間空格大小寫英文數字中文
function check_word(word){
    let word_check = /^[\sa-zA-Z0-9\u4e00-\u9fa5\-]+$/g;
    return word_check.test(word)
}

function check_input(){
    let check_input = document.querySelectorAll('input')
    var max = 0;
    for(var i = 0 ;i<check_input.length;i++){
        //input 檢查顏色
        if(check_input[i].style.color=='red')
        {
            max++
        }
        //每個input.value去頭去尾空格檢查
        if( check_word( check_input[i].value.trim() ) !=true )
        {
            max++
        }
    }
    return max
}
function check_function(){
    let check_box= document.getElementsByClassName('check_box');
    var count = check_input();
    if(check_input()>0){
        check_box[0].style.visibility='visible'
    }else if(check_input()<=0){
        check_box[0].style.visibility='hidden'
    }
    // console.log(count)
}

    var time_to_check = setInterval(check_function, 2000)




module.exports = {
    check_price_num,
    check_phone_num,
    phone_up_key
}
  