export default class Clock {
    constructor() {
        this.startClock()
        this.count = document.querySelectorAll('.timer').length
    }

    startClock() {

        setInterval(() => {

            for(let n = 0; n < this.count ; n++){
                $(`#timer${n}`).load(`http://localhost:3000/respawn-table #timer${n}`)
            }

        }, 1000)
    }

}