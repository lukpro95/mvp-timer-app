import Clock from './modules/clock.js'
import Edit from './modules/edit-btn.js'
import Chat from './modules/chat.js'

if(document.querySelector("#time-table")){
    new Clock()
}

if(document.querySelector("#database-table")){
    new Edit()
}

if(document.querySelector("#chat-wrapper")) {
    new Chat()
}