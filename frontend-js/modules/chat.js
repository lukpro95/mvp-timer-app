import DOMPurify from 'dompurify'
import axios from 'axios'

export default class Chat {

    constructor() {
        // this.openedYet = false
        this.openConnection()
        this.chatIcon = document.querySelector("#chat-icon")
        this.chatWrapper = document.querySelector("#chat-wrapper")
        this.injectHTML()
        this.closeIcon = document.querySelector(".chat-title-bar-close")
        this.chatField = document.querySelector("#chatField")
        this.chatLog = document.querySelector(".chat-log")
        this.form = document.querySelector("#chatForm")
        this.events()
    }

    // events

    events() {
        this.chatIcon.addEventListener('click', () => this.showChat())

        this.closeIcon.addEventListener('click', () => this.hideChat())

        this.form.addEventListener('submit', (e) => {
            e.preventDefault()
            axios.post('/save-chat', {
                time: new Date(),
                message: this.chatField.value
            })
            .then(() => {
                console.log("Saved chat.")
            })
            .catch(()=> {
                console.log("Couldn't save chat.")
            })
            this.sendMSGToServer()
            
        })
    }

    // methods

    // access
    
    showChat() {
        this.chatIcon.classList.remove('chat--visible')
        this.chatWrapper.classList.add('chat--visible')
        this.chatField.focus()
    }

    hideChat() {
        this.chatIcon.classList.add('chat--visible')
        this.chatWrapper.classList.remove('chat--visible')
    }

    openConnection() {
        
        this.socket = io()
        console.log("Hi")
        this.socket.on('chatMessageFromServer', (data) => {
            this.displayMessageFromServer(data)
        })

        axios.get('/load-chat')
        .then((result) => {
            this.displayPreviousChat(result.data)
        })
        .catch(() => {
            console.log("Loading chat crashed.")
        })

    }

    injectHTML() {
        this.chatWrapper.innerHTML = `
        <div class="chat-title-bar">Chat <span class="chat-title-bar-close">X</span></div>
        <div id="chat" class="chat-log"></div>
        <form id="chatForm" class="chat-form border-top">
            <input type="text" class="chat-field" id="chatField" placeholder="Type a message…" autocomplete="off">
        </form>
        `
    }

    // display from server

    sanitizeHTML(string) {

        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            "/": '&#x2F;',
            "`": '&grave;'
        };

        const reg = /[&<>"'/]/ig;

        return string.replace(reg, (match)=>(map[match]));
    }

    displayPreviousChat(data) {
        data.forEach((singleData) => {
            
            if(singleData.username === singleData.sessionUsername) {
                this.chatLog.insertAdjacentHTML('beforeend', DOMPurify.sanitize(`<div class="chat-self">
                    <div class="chat-message">
                        <div class="chat-message-inner">
                            ${this.sanitizeHTML(singleData.message)}
                        </div>
                    </div>
                    <div class="chat-time">
                        ${new Date(singleData.time).getHours()}:${new Date(singleData.time).getMinutes()}
                    </div>
                </div>`))
            } else {
                this.chatLog.insertAdjacentHTML('beforeend', DOMPurify.sanitize(`<div class="chat-other">
                    <div class="chat-time">
                        ${new Date(singleData.time).getHours()}:${new Date(singleData.time).getMinutes()}
                    </div>
                    <div class="chat-message"><div class="chat-message-inner">
                  <strong>${singleData.username}:</strong>
                  ${this.sanitizeHTML(singleData.message)}
                    </div>
                </div>`))
            }

            this.chatLog.scrollTop = this.chatLog.scrollHeight
        })
    }

    // receiving real time

    displayMessageFromServer(data) {
        this.chatLog.insertAdjacentHTML('beforeend', DOMPurify.sanitize(`
        <div class="chat-other">
            <div class="chat-time">
                ${new Date().getHours()}:${new Date().getMinutes()}
            </div>
            <div class="chat-message"><div class="chat-message-inner">
          <strong>${data.username}:</strong>
          ${this.sanitizeHTML(data.message)}
            </div>
        </div>
        `))
        this.chatLog.scrollTop = this.chatLog.scrollHeight
    }

    // sending real time

    sendMSGToServer() {
        this.socket.emit('chatMessageFromBrowser', {message: this.chatField.value})
        
        this.chatLog.insertAdjacentHTML('beforeend', DOMPurify.sanitize(`
        
        <div class="chat-self">
            <div class="chat-message">
                <div class="chat-message-inner">
                    ${this.sanitizeHTML(this.chatField.value)}
                </div>
            </div>
            <div class="chat-time">
                ${new Date().getHours()}:${new Date().getMinutes()}
            </div>
        </div>

        `))

        this.chatField.value = ""
        this.chatLog.scrollTop = this.chatLog.scrollHeight
    }

}