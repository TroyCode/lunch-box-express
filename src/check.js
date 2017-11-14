function check_price_num(need_ckeck){
    var price_check = /^[0-9]+$/
    return price_check.test(need_ckeck);
}
function check_phone_num(phone_num){
    let phone_check=/^[0-9]{10}$/;
    return (phone_check.test(phone_num))
}

module.exports = {
    check_phone_num
}