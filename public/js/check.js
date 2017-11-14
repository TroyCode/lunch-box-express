function check_price_num(need_ckeck){
    var price_check = /^[0-9]+$/
    return price_check.test(need_ckeck);
}
function check_phone_num(phone_num){
    let phone_check=/^[0-9]{2}-[0-9]{8}$/;
    return (phone_check.test(phone_num))
}
function phone_press_key(num){
    var num_check = /[0-9]{2}/
    if(num.length==2 && num_check.test(num)==true){
        document.getElementById('shop_phone').value=num+'-'
    }
}