export default class Clock {
    constructor() {
        this.startClock()
        this.count = document.querySelectorAll('.timer').length
    }

    startClock() {

        setInterval(() => {

            for(let n = 0; n < this.count ; n++){
                $(`#timer${n}`).load(`https://mvptimerapp.herokuapp.com/respawn-table #timer${n}`)
            }

        }, 1000)
    }

}