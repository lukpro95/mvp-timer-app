export default class Clock {
    constructor() {
        this.startClock()
        this.count = document.querySelectorAll('.timer').length
    }

    startClock() {

        setInterval(() => {
            console.log(new Date())
            for(let n = 0; n < this.count ; n++){
                $(`#timer${n}`).load(`${document.URL} #timer${n}`)
            }

        }, 1000)
    }

}