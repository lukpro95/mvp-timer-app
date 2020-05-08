const Boss = require('../models/Boss.js')
const router = require('../router.js')

exports.viewTable = (req, res) => {

    let url = req.path.substring(1)

    Boss.viewTable()
    .then((bosses) => {
        res.render(url, {
            bosses: bosses
        })
    })
    .catch((errors)=> {
        errors.forEach(error => {
            req.flash('errors', error)
        });
        req.session.save(() => {
            res.redirect(url)
        })
    })

}

exports.addBoss = (req, res) => {
    
    let boss = new Boss(req.body)

    boss.addBoss()
    .then((success) => {
        success.forEach(success => {
            req.flash('success', success)
        });
        req.session.save(() => {
            res.redirect('/database-table')
        })
    })
    .catch((errors) => {
        errors.forEach(error => {
            req.flash('errors', error)
        });
        req.session.save(() => {
            res.redirect('/database-table')
        })
    })
}

exports.removeBoss = (req, res) => {

    let boss = new Boss(req.body)

    boss.removeBoss()
    .then((success) => {
        success.forEach(success => {
            req.flash('success', success)
        });
        req.session.save(() => {
            res.redirect('/database-table')
        })
    })
    .catch((error) => {
        req.flash('errors', error)
        req.session.save(() => {
            res.redirect('/database-table')
        })
    })
}

exports.editBoss = (req, res) => {

    let boss = new Boss(req.body)

    boss.editBoss()
    .then((success) => {
        success.forEach(success => {
            req.flash('success', success)
        });
        req.session.save(() => {
            res.redirect('/database-table')
        })
    })
    .catch((errors) => {
        errors.forEach(error => {
            req.flash('errors', error)
        });
        req.session.save(() => {
            res.redirect('/database-table')
        })
    })

}

exports.launchTimer = (req, res) => {

    Boss.updateSpawn(req)
    .then((success) => {
        success.forEach(success => {
            req.flash('success', success)
        });
        req.session.save(() => {
            res.redirect('/respawn-table')
        })
    })
    .catch((errors) => {
        errors.forEach(error => {
            req.flash('errors', error)
        });
        req.session.save(() => {
            res.redirect('/respawn-table')
        })
    })

}

exports.resetTimers = () => {

    console.log("Resetting Timers due to restart of the server.")
    Boss.resetTimers().then((string) => {
        console.log(string)
    })
   
}