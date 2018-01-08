class Food extends Entity{
    constructor(){
        super();
        this.color=[255,255,255];
        this.size=2
        var randomMicrobe=microbes[Math.floor(Math.random() *microbes.length)];
        if(randomMicrobe){
            var p=this.randompos(randomMicrobe.x,randomMicrobe.y,randomMicrobe.searchradius);
        }else{
            var p=this.randompos();
        }
        this.x=p[0];
        this.y=p[1];
    }
    draw(){

        ctx.setLineDash([]) //disable dashing
        ctx.beginPath(); //start new path
        ctx.fillStyle=this.convertColor(this.color); //set color
        ctx.ellipse(
            this.x, //x
            this.y, //y
            this.size, //radiusX
            this.size, //radiusY
            this.angle * Math.PI/180, //rotation
            0, //startAngle
            2 * Math.PI //endAngle
        );
        ctx.fill(); //actually draw
        super.draw()
    }
    randompos(nearx=null,neary=null,near=0){
        var p=super.randompos(nearx, neary, near);
        var x=p[0];
        var y=p[1]
        if(x<0){x=0;}
        if(x>=canvas.width){x=canvas.width-1;}
        if(y>=canvas.height){y=canvas.height-1;}
        if(y<0){y=0;}
        return [x,y];

    }
}

