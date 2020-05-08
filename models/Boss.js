const bossCollection = require('../db.js').db().collection('bosses')
const ObjectID = require('mongodb').ObjectID

let Boss = function(data) {
    
    if(data.id){ // for editing and deleting
        this.id = data.id
    }

    this.data = {
        name: data.name,
        map: data.map,
        minResp: data.minResp,
        maxResp: data.maxResp,
        timeRun: new Date(),
        timeSlain: new Date(),
        minTimeSpawn: -1,
        maxTimeSpawn: -1
    }
    this.errors = []
    this.success = []
}

Boss.prototype.validate = function() {
    return new Promise(async (resolve, reject) => {

        if(this.data.name == ""){this.errors.push("You must provide a name of a Boss.")}
        if(this.data.map == ""){this.errors.push("You must provide a map location of a Boss.")}
        if(this.data.minResp == ""){this.errors.push("You must provide a minimum respawn time of a Boss.")}
        if(this.data.maxResp == ""){this.errors.push("You must provide a maximum respawn time of a Boss.")}

        if(!this.errors.length){
            await this.checkIfExists()
        }

        resolve()

    })
}

Boss.prototype.cleanUp = function() {
    if(typeof(this.data.name)   != "string"){this.data.username = ""}
    if(typeof(this.data.map)    != "string"){this.data.email = ""}
    if(isNaN(this.data.minResp)){this.data.minResp = 0}
    if(isNaN(this.data.maxResp)){this.data.maxResp = 0}

    let timestamp = new Date()
    timestamp = timestamp.setHours(timestamp.getHours()+2)
    timestamp = new Date(timestamp)

    this.data = {
        name: this.data.name.trim(),
        map: this.data.map.trim().toLowerCase(),
        minResp: this.data.minResp,
        maxResp: this.data.maxResp,
        timeRun: new Date(),
        timeSlain: timestamp,
        minTimeSpawn: -1,
        maxTimeSpawn: -1
    }
}

Boss.prototype.addBoss = function () {
    return new Promise(async (resolve, reject) => {
        this.cleanUp()
        await this.validate()

        if(!this.errors.length){
            let boss = await bossCollection.insertOne(this.data)
            this.success.push("The Boss has been added to the table!")
            resolve(this.success)
        } else {
            reject(this.errors)
        }

    })
}

Boss.prototype.removeBoss = function () {
    return new Promise(async (resolve, reject) => {

        try {
            let boss = await bossCollection.deleteOne({_id: new ObjectID(this.id)})
            this.success.push("Successfully deleted.")
            resolve(this.success)
        } catch {
            this.errors.push("Unexpected error. Try again later.")
            reject(this.errors)
        }

    })
}

Boss.prototype.checkIfExists = async function () {
        if(this.id) {
            let bossExists = await bossCollection.findOne({_id: { $nin: [new ObjectID(this.id)]}, name: this.data.name, map: this.data.map})
            if(bossExists) {this.errors.push("This boss is already in database.")}
        } else {
            let bossExists = await bossCollection.findOne({name: this.data.name, map: this.data.map})
            if(bossExists) {this.errors.push("This boss is already in database.")}
        }
}

Boss.prototype.editBoss = function () {
        return new Promise(async (resolve, reject) => {

        await this.checkIfExists()

        if(!this.errors.length) {
            await bossCollection.findOneAndUpdate({_id: new ObjectID(this.id)}, {$set: {name: this.data.name, map: this.data.map, minResp: this.data.minResp, maxResp: this.data.maxResp}})
            this.success.push("Successfully edited.")
            resolve(this.success)
        } else {
            reject(this.errors)
        }

    })
}

function createTimestamp(hours, minutes) {

    if(hours && minutes) {
        let timeSet = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), hours, minutes)
        console.log("Timestamp for Slain: " + timeSet)
        return timeSet
    } else {
        let timeSet = new Date()
        timeSet.setHours(timeSet.getHours()+2)
        timeSet = new Date(timeSet)
        console.log("Current timestamp: " + timeSet)
        return timeSet
    }

}

Boss.updateSpawn = function (req) {
    return new Promise(async (resolve, reject) => {

        this.success = []
        this.errors = []
        let hours = req.body.time.substring(0,2)
        let minutes = req.body.time.substring(3,5)

        let dateSlain = createTimestamp(hours, minutes)
        let run = createTimestamp()
        let boss = await bossCollection.findOne({_id: new ObjectID(req.body.id)})

        let timestamp = createTimestamp()
        let diff = ((timestamp.getTime() - dateSlain.getTime())/60000)
        let diffMax = boss.maxResp - diff

        if(dateSlain.toString() > createTimestamp().toString()) { this.errors.push("That's cheating! You can't see into the future!")}
        else if(diffMax < 0) { this.errors.push("This Boss has exceeded its respawn period since the time given!")}

        try {
            if(this.errors.length < 1){
                let currentTime = new Date()
                let minUpdate = parseInt(boss.minResp - ((currentTime.getTime() - dateSlain.getTime())/60000))
                let maxUpdate = parseInt(boss.maxResp - ((currentTime.getTime() - dateSlain.getTime())/60000))

                await bossCollection.updateOne({_id: new ObjectID(req.body.id)}, {$set: {timeRun: run, timeSlain: dateSlain, minTimeSpawn: minUpdate, maxTimeSpawn: maxUpdate}})
                boss = await bossCollection.findOne({_id: new ObjectID(req.body.id)})
                this.keepTrack(boss._id, boss.timeSlain, boss.minResp, boss.maxResp, boss.timeRun)

                this.success.push(`Timer for ${boss.name} launched.`)
                resolve(this.success)
            } else {
                await bossCollection.updateOne({_id: new ObjectID(req.body.id)}, {$set: {minTimeSpawn: -1, maxTimeSpawn: -1}})
                reject(this.errors)
            }
        } catch {
            reject(this.errors.push("Unexpected error. Try again later."))
        }

    })
}

Boss.keepTrack = function (_id, timeSlain, minResp, maxResp, timeRun) {

    let timer

    timer = setInterval(async () => {
        let boss = await bossCollection.findOne({_id: new ObjectID(_id)})
        let min, max

        let currentTime = new Date()
        let minUpdate = parseInt(minResp - ((currentTime.getTime() - timeSlain.getTime())/60000))
        let maxUpdate = parseInt(maxResp - ((currentTime.getTime() - timeSlain.getTime())/60000))

        if(boss.minTimeSpawn > 0) {min = minUpdate} else {min = 0}
        if(boss.maxTimeSpawn > 0) {max = maxUpdate} else {max = 0}
        if(boss.minTimeSpawn == 0 && boss.maxTimeSpawn == 0) {clearInterval(timer)}
        
        if(boss.timeRun.toString() == timeRun.toString()) {
            await bossCollection.updateOne({_id: new ObjectID(boss._id)}, {$set: {minTimeSpawn: min, maxTimeSpawn: max}})
        } else {clearInterval(timer)}
    }, 10000)

}

Boss.viewTable = function (){
    return new Promise(async (resolve, reject) => {

        this.errors = []
        bossCollection.find({}).sort({ name: 1 }).toArray(function (err, result) {
            if (err) {
                this.errors.push("An unknown error has occurred. Try again later.")
                reject(this.errors)
            }
            resolve(result)
        })

    })
}

Boss.resetTimers = function () {
    return new Promise(async (resolve, reject) => {

        bossCollection.find({}).toArray(function (err, result) {
            result.forEach(async (boss) => {
                await bossCollection.updateOne({_id: new ObjectID(boss._id)}, {$set: {minTimeSpawn: -1, maxTimeSpawn: -1}})
            })
            resolve("Reset has been completed.")
        })

    })
}

module.exports = Boss