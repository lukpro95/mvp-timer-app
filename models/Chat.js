const chatCollection = require('../db.js').db().collection('chat')
const userCollection = require('../db.js').db().collection('users')
const ObjectID = require('mongodb').ObjectID

let Chat = function(data) {
    this.data = {
        time: data.time,
        userId: data.userId,
        message: data.message
    }
}

Chat.prototype.findNameByID = function() {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await userCollection.findOne({_id: new ObjectID(this.data.userId)})
            this.data.username = user.username
            resolve()
        } catch {
            reject()
        }

    })
}

Chat.prototype.saveMessage = function() {

    this.findNameByID().then(async () => {
        await chatCollection.insertOne({time: this.data.time, username: this.data.username, message: this.data.message})
    }).catch(() => {
        console.log("This user doesn't exist or has ceased to exist.")
    })

}

Chat.loadChat = function () {
    return new Promise(async (resolve, reject) => {
        chatCollection.find({}).sort({ time: 1 }).toArray(function (err, result) {
            if (err) {
                reject("An unknown error has occurred. Try again later.")
            }
            resolve(result)
        })
    })
}

Chat.clean = function () {
    return new Promise(async (resolve, reject) => {
        
        try {
            await chatCollection.deleteMany({})
            resolve()
        } catch {
            reject()
        }

    })
}

module.exports = Chat