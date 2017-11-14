const index = require('../public/js/check.js')
const assert = require('chai').assert

//檢查價錢是否數字
describe('price_num', () => {
    it('should be number', () => {
        assert.isTrue(index.check_price_num(1234567890), 'time should be true')
        assert.isTrue(index.check_price_num('0987654321'), 'time should be true')			
        assert.isTrue(index.check_price_num(1), 'time should be true')			
        assert.isTrue(index.check_price_num(12345), 'time should be true')			
    })
    it('should be false', () => {
        assert.isFalse(index.check_price_num('asdfghj'), 'time should be true')
        assert.isFalse(index.check_price_num('a'), 'time should be true')			
        assert.isFalse(index.check_price_num('@#$%^&*'), 'time should be true')			
        assert.isFalse(index.check_price_num('<img >'), 'time should be true')			
    })
})
//檢查是否為電話 xx-xxxxxxxx
describe('phone_num', () => {
    it('should be phone', () => {
        assert.isTrue(index.check_phone_num('12-34567890'), '12-34567890 should be true')
        assert.isTrue(index.check_phone_num('09-12345678'), '09- should be true')			
    })
    it('should be false', () => {
        assert.isFalse(index.check_phone_num('asdfghj'), '多個英文 should be false')
        assert.isFalse(index.check_phone_num('中文'), '中文 should be false')			
        assert.isFalse(index.check_phone_num('@#$%^&*'), 'time should be false')			
        assert.isFalse(index.check_phone_num('<img >'), '文字符號混合 should be false')        
        assert.isFalse(index.check_phone_num(1234567890), '純數字 should be false')			
        
    })
})
//檢查是否為大小寫英文｜｜中文｜｜數字
describe('phone_num', () => {
    it('should be phone', () => {
        assert.isTrue(index.check_word('34567890'), '數字 should be true')
        assert.isTrue(index.check_word('09-12345678'), '數字-數字 should be true')
        assert.isTrue(index.check_word(' '), '空格 should be true')
        assert.isTrue(index.check_word('aa bb cc'), '英文混空格 should be true')
        assert.isTrue(index.check_word('中文 檢查'), '中文混空格 should be true')
        
    })
    it('should be false', () => {
        assert.isFalse(index.check_word(';'), '分號 should be false')			
        assert.isFalse(index.check_word('@#$%^&*'), '符號 should be false')			
        assert.isFalse(index.check_word('<img >'), '英文符號混雜 should be false')        
   
    })
})

