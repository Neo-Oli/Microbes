import Entity from './entity'
export default class Food extends Entity {
  constructor (ui) {
    super(ui)
    this.name = 'Food'
    this.ui.checkAchievements()
    this.color = [255, 255, 255]
    this.size = 2
    const randomMicrobe = this.ui.microbes[Math.floor(Math.random() * this.ui.microbes.length)]
    let p
    if (randomMicrobe) {
      p = this.randompos(randomMicrobe.x, randomMicrobe.y, randomMicrobe.searchradius)
    } else {
      p = this.randompos()
    }
    this.x = p[0]
    this.y = p[1]
  }

  draw () {
    this.ui.ctx.setLineDash([]) // disable dashing
    this.ui.ctx.beginPath() // start new path
    this.ui.ctx.fillStyle = this.convertColor(this.color) // set color
    this.ui.ctx.ellipse(
      this.x, // x
      this.y, // y
      this.size, // radiusX
      this.size, // radiusY
      this.angle * Math.PI / 180, // rotation
      0, // startAngle
      2 * Math.PI // endAngle
    )
    this.ui.ctx.fill() // actually draw
    super.draw()
  }

  randompos (nearx = null, neary = null, near = 0) {
    const p = super.randompos(nearx, neary, near)
    let x = p[0]
    let y = p[1]
    if (x < 0) { x = 0 }
    if (x >= this.ui.canvas.width) { x = this.ui.canvas.width - 1 }
    if (y >= this.ui.canvas.height) { y = this.ui.canvas.height - 1 }
    if (y < 0) { y = 0 }
    return [x, y]
  }
}
