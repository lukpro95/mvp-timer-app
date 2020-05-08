const express = require('express')
const router = require('./router.js')
const flash = require('connect-flash')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const sanitizeHTML = require('sanitize-html')

const app = express()

let sessionOptions = session({
    secret: "Itss totttally avesome!",
    store: new MongoStore({client: require('./db')}),
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 1000 * 60 * 60 * 24, httpOnly: true} // 1 day
})

app.use(sessionOptions)
app.use(flash())

app.use(function(req, res, next) {

    //sanitizing
    res.locals.filterUserHTML = function(content){
        return sanitizeHTML(markdown(content), {allowedTags: [], allowedAttributes: []})
    }

    //make all error and success flash messages available from all templates
    res.locals.errors = req.flash("errors")
    res.locals.success = req.flash("success")

    //make current user id available on the req object
    if(req.session.user){req.visitorID = req.session.user._id} else {req.visitorID = 0}

    //make user session data available from withing view templates
    res.locals.user = req.session.user // global use of current user of current session
    next()
})

app.set("views", "views")
app.set('view engine', 'ejs')

app.use(express.json())
app.use(express.urlencoded({extended: false})) // accepting html submit form data !!IMPORTANT
app.use(express.static('./public'))
app.use('/', router)

const server = require('http').createServer(app)
const io = require('socket.io')(server)

io.use(function(socket, next) {
    sessionOptions(socket.request, socket.request.res, next)
})

io.on('connection', function(socket) {
    if(socket.request.session.user){
        let user = socket.request.session.user

        socket.on('chatMessageFromBrowser', (data) => {
            socket.broadcast.emit('chatMessageFromServer', {message: sanitizeHTML(data.message, {allowedTags: [], allowedAttributes: []}), username: user.username})
        })

    }
})

module.exports = server