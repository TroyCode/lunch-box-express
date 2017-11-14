
const index = require('../public/js/create_js.js')
const assert = require('chai').assert
const time_check = /^[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}T[0-9]{1,2}:[0-9]{1,2}/;
describe('time_back', () => {
		it('should faler', () => {
			assert.isTrue(time_check.test(index.time_back()), 'time should be true')			
		})
})
