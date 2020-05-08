const validator = require('validator')
const bcrypt = require('bcryptjs')
const usersCollection = require('../db.js').db().collection("users")

let User = function(data) {
    this.data = data
    this.error = []
}

User.prototype.cleanUp = function() {

    if(typeof(this.data.username)   != "string"){this.data.username = ""}
    if(typeof(this.data.email)      != "string"){this.data.email = ""}
    if(typeof(this.data.password)   != "string"){this.data.password = ""}

    this.data = {
        username: this.data.username.trim().toLowerCase(),
        email: this.data.email.trim().toLowerCase(),
        password: this.data.password
    }

}

User.prototype.validate = function() {
    return new Promise(async (resolve, reject) => {
        // Username related
        if(this.data.username == "") {this.error.push("You must provide a username.")}
        if(this.data.username.length < 4) {this.error.push("The username has to be at least 4 characters long.")}
        if(this.data.username.length > 20) {this.error.push("The username cannot be longer than 20 characters.")}
        if(!validator.isAlphanumeric(this.data.username)) {this.error.push("The username can only contain numbers and letters.")}

        // Email related
        if(this.data.email == "") {this.error.push("You must provide an email address.")}
        if(!validator.isEmail(this.data.email) || this.data.email == "") {this.error.push("You must provide a valid email.")}

        // Password related
        if(this.data.password == "") {this.error.push("You must provide a password.")}
        if(this.data.password.length < 8) {this.error.push("The password has to be at least 8 characters long.")}
        if(this.data.password.length > 30) {this.error.push("The password cannot be longer than 30 characters.")}

        // if valid then if already taken
        if(this.data.username.length >= 4 && this.data.username.length <= 20) {
            let usernameExists = await usersCollection.findOne({username: this.data.username})
            if(usernameExists){this.error.push("This username has already been taken.")}
        }

        // if valid then if already taken
        if(validator.isEmail(this.data.email)) {
            let emailExists = await usersCollection.findOne({email: this.data.email})
            if(emailExists){this.error.push("This username has already been taken.")}
        }

        resolve()

    })

}

User.prototype.register = function () {
    return new Promise(async (resolve, reject) => {

        this.cleanUp()
        await this.validate()
    
        if(!this.error.length){
            let salt = bcrypt.genSaltSync(10)
            this.data.password = bcrypt.hashSync(this.data.password, salt)
            let user = await usersCollection.insertOne(this.data)
            resolve()
        } else {
            reject(this.error)
        }

    })

}

User.prototype.logIn = function () {
    return new Promise(async (resolve, reject) => {
        this.cleanUp()

        usersCollection.findOne({username: this.data.username})
        .then((attemptedClient)=>{

            if(attemptedClient && bcrypt.compareSync(this.data.password, attemptedClient.password)){
                this.data = attemptedClient
                resolve()
            } else {
                this.error.push("Invalid username / password.")
                reject(this.error)
            }

        })
        .catch(()=> {
            this.error.push("Please try again later.")
            reject(this.error)
        })

    })
}

User.prototype.logOut = function () {

}

module.exports = User