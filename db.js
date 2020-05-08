const mongodb = require('mongodb')
const dotenv = require('dotenv')

dotenv.config()

mongodb.connect(process.env.CONNECTION, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, client) {
    module.exports = client
    const app = require('./app.js')

    app.listen(process.env.PORT)
})