const express = require('express')
const router = express.Router()
const { userController } = require('../controller')
const Auth = require('../middleware/auth')

router.post('/login', userController.login)

router.get('/verify', Auth.verifyToken, userController.verify)

module.exports = router