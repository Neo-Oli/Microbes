export default class Achievement {
  constructor (ui, icon, name, blurb, code) {
    this.ui = ui
    this.name = name
    this.blurb = blurb
    this.code = code
    this.icon = icon
    this.type = 'Achievement'
    this.done = false
  }

  check () {
    if (this.done) {
      return false
    }

    const result = this.code()

    if (result) {
      this.done = true
      this.addToQ()
    }
    return result
  }

  addToQ () {
    this.ui.achievementQ.push(this)
  }

  save () {
    const obj = this
    delete obj.ui
    return obj
  }
}
