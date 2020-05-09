export default class Edit {
    constructor() {

        this.details = document.getElementById("details")
        this.id = document.getElementById("hidden")
        this.name = document.getElementById("name")
        this.map = document.getElementById("map")
        this.minResp = document.getElementById("min")
        this.maxResp = document.getElementById("max")
        this.buttons = document.getElementById("buttons")
        this.record = document.getElementById("boss-record")
        this.editBtn = document.getElementById("edit-btn")

        this.edit()

    }

    edit()  {

            this.editBtn.addEventListener("click", (e) => {
                e.preventDefault()
        
                this.record.removeChild(this.details)
                this.record.removeChild(this.buttons)
        
                let bossName = this.name.innerHTML
                let bossMap = this.map.innerHTML.substring(1, this.map.innerHTML.length-1)
                let min = this.minResp.innerText.substring(0, this.minResp.innerText.length-8)
                let max = this.maxResp.innerText.substring(0, this.maxResp.innerText.length-8)
        
                this.record.insertAdjacentHTML
                ("afterbegin", `
                    <form action="/database-table/edit" method="POST" id="edit-form">
                        <input type="text" id="name" name="name" value="${bossName}" placeholder="Name of a Boss" autocomplete="off">
                        <input type="text" id="map" name="map" value="${bossMap}" placeholder="Location" autocomplete="off">
                        <input type="number" id="min" name="minResp" value="${min}" placeholder="Min. Respawn (min)" autocomplete="off">
                        <input type="number" id="max" name="maxResp" value="${max}" placeholder="Max. Respawn (min)" autocomplete="off">
                        <input type="text" id="hidden" name="id" value="${this.id.value}">
                        <button class="btn btn-save access" type="submit">Save</button>
                    </form>
                `)
            })

    }

}