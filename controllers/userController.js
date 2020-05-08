const User = require('../models/User.js')

exports.login = (req, res) => {
    let user = new User(req.body)

    user.logIn()
    .then(() => {
        req.session.user = {_id: user.data._id, username: user.data.username}
        req.session.save(() => {
            res.redirect('/')
        })
    })
    .catch((e) => {
        e.forEach(error => {
            req.flash('errors', error)
        });
        req.session.save(() => {
            res.redirect('/')
        })
    })

}

exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/')
    })
}

exports.register = (req, res) => {
    let user = new User(req.body)

    user.register()
    .then(() => {
        req.session.user = {_id: user.data._id, username: user.data.username}
        req.session.save(() => {
            res.redirect('/')
        })
    })
    .catch((regErrors) => {
        regErrors.forEach(error => {
            req.flash('regErrors', error)
        });
        req.session.save(() => {
            res.redirect('/')
        })
    })

}

exports.isLoggedIn = (req, res, next) => {

    if(req.session.user){
        next()
    } else {
        req.flash("errors", "You must be logged in to perform that action!")
        req.session.save(function() {
            res.redirect('/')
        })
    }
}

exports.home = (req, res) => {
    if(req.session.user){
        res.render('home-user')
    } else {
        res.render('home-guest', {regErrors: req.flash('regErrors')})
    }
}