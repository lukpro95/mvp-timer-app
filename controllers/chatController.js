const Chat = require('../models/Chat.js')

exports.save = function (req, res) {

    let data = {
        time: req.body.time,
        userId: req.session.user._id,
        message: req.body.message
    }

    let chat = new Chat(data)

    chat.saveMessage()
    
}

exports.load = function (req, res) {

    Chat.loadChat().then((result) => {
        result.forEach((single) => {
            single.sessionUsername = req.session.user.username
        })
        res.send(result)
    })
    .catch(() => {
        console.log("Didnt Load.")
        res.send(null)
    })

}

exports.cleanChat = async function () {
    let firstDay = new Date().getDate()
    setInterval(() => {
        
        if(new Date().getHours() == 1) {
            Chat.clean()
            .then(() => {
                console.log("Success")
            })
            .catch(() => {
                console.log("Fail.")
            })
        }
        
    }, 1000);

}