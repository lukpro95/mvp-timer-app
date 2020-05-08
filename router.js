const express = require('express')
const router = express.Router()
const userController = require('./controllers/userController.js')
const bossController = require('./controllers/bossController.js')
const chatController = require('./controllers/chatController.js')

bossController.resetTimers()
chatController.cleanChat()

// user related
router.get('/', userController.home)
router.post('/register', userController.register)
router.post('/login', userController.login)
router.post('/logout', userController.logout)

// chat related
router.post('/save-chat', userController.isLoggedIn, chatController.save)
router.get('/load-chat', userController.isLoggedIn, chatController.load)

// boss gets if logged In
router.get('/respawn-table', userController.isLoggedIn, bossController.viewTable)
router.get('/database-table', userController.isLoggedIn, bossController.viewTable)
router.get('/launch-timer', userController.isLoggedIn)

//boss posts if logged In
router.post('/respawn-table/launch-timer', userController.isLoggedIn, bossController.launchTimer)
router.post('/database-table/add', userController.isLoggedIn, bossController.addBoss)
router.post('/database-table/edit', userController.isLoggedIn, bossController.editBoss)
router.post('/database-table/delete', userController.isLoggedIn, bossController.removeBoss)

module.exports = router