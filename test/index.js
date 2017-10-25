const assert = require('chai').assert
const request = require('supertest')
const server = require('../index')

describe('login', () => {
	describe('GET', () => {
		it('should pass', () => {
			return request(server)
			.get('/login')
			.expect(200)
		})
	})
})