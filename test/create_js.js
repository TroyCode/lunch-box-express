const index = require('../public/javascript/main.js')
const assert = require('chai').assert

describe('time_back', () => {
		it('should pass', () => {
			return request(server)
			.get('/login')
			.expect(200)
		})
})