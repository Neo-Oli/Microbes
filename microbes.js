var debug=false;
var numMicrobes=3;
var colors=["#FF0000","#00FF00","#0000FF","#FFFF00"];
function line(x0, y0, x1, y1){
    var dx = Math.abs(x1-x0);
    var dy = Math.abs(y1-y0);
    var sx = (x0 < x1) ? 1 : -1;
    var sy = (y0 < y1) ? 1 : -1;
    var err = dx-dy;
    var x=null;
    var y=null;
    var path=[]
    while(true){
        path.push([x0,y0]);

        if ((x0==x1) && (y0==y1)) break
        var e2 = 2*err;
        if (e2 >-dy){ err -= dy; x0  += sx; }
        if (e2 < dx){ err += dx; y0  += sy; }
    }
    return path;
}

function sortFunction(a, b) {
    if (a[0] === b[0]) {
        return 0;
    }
    else {
        return (a[0] < b[0]) ? -1 : 1;
    }
}
class Entity{
    constructor(x=null,y=null) {
        this.color="#FF0000";
        if(!x && !y){
            this.randompos();
        }else{
            this.x=x;
            this.y=y;
        }
        this.defaultlife=1000
        this.life=this.defaultlife;
        this.size=2;
        this.angle=0
    }
    randompos(){
        this.x=Math.floor(Math.random() * canvas.width);
        this.y=Math.floor(Math.random() * canvas.height);
    }
    draw(){

    }
    rotate(step){
        this.angle=this.positiveAngle(this.angle + step);
    }
    distanceTo(e){
        var a=this.x - e.x;
        var b=this.y - e.y;
        var csqrt=Math.pow(a,2) + Math.pow(b,2);
        var c=Math.pow(csqrt,1/2);
        return c;
    }
    positiveAngle(angle){
        while(angle>360){
            angle=angle-360;
        }
        while(angle<0){
            angle=angle+360;
        }
        return angle;
    }
    tick(){
        this.life-=1;
        if(this.life<=0){
            return false;
        }
        return true;
    }
}
class Microbe extends Entity{
    constructor(x=null,y=null){
        super(x,y);
        this.getRandomColor();
        this.target=null;
        this.targetangle=300;
        this.path=[];
        this.defaultsize=2
        this.size=this.defaultsize;
        this.maxsize=5;
        this.wait=100;
        this.searchradius=300;
        this.dying=null;
    }
    getRandomColor(){
        this.color=colors[Math.floor(Math.random()*colors.length)];
    }
    draw(){
        if(debug){
            //for(var pi in this.path){
            //var p=this.path[pi];
            //ctx.fillStyle = "lime";
            //ctx.fillRect(p[0],p[1],1,1);
            //}
            if(this.target && this.path.length>2){
                ctx.strokeStyle="lime"; //set color
                ctx.beginPath();
                ctx.moveTo(this.path[0][0],this.path[0][1]);
                ctx.lineTo(this.path[this.path.length-1][0],this.path[this.path.length-1][1]);
                ctx.stroke();
            }
        }
        ctx.setLineDash([]) //disable dashing
        ctx.beginPath(); //start new path
        ctx.strokeStyle=this.color; //set color
        ctx.ellipse(
            this.x, //x
            this.y, //y
            this.size, //radiusX
            this.size*1.6, //radiusY
            this.angle * Math.PI/180, //rotation
            0, //startAngle
            2 * Math.PI //endAngle
        );
        ctx.stroke(); //actually draw
        ctx.fillStyle = "yellow";
        var p=this.rotatepoint(this.x,this.y-this.size,this.angle,this.x,this.y)
        ctx.fillRect(p[0],p[1],1,1);
        super.draw();
    }
    rotatepoint(x,y,angle,cx,cy){
        var radians = (Math.PI / 180) * angle,
            cos = Math.cos(radians),
            sin = Math.sin(radians),
            nx = (cos * (x - cx)) - (sin * (y - cy)) + cx,
            ny = (cos * (y - cy)) + (sin * (x - cx)) + cy;
        return [nx,ny];
    }
    searchpath(){
        this.path=line(this.x,this.y,this.target.x,this.target.y);

        this.targetangle = Math.atan2(this.y - this.target.y, this.x - this.target.x) * 180 / Math.PI;
        this.targetangle = Math.round(this.positiveAngle(this.targetangle-90));
    }
    travel(){
        if(!this.path.length){
            this.searchpath()
        }
        if(this.targetangle!=this.angle){
            if((this.targetangle - this.angle + 360) % 360 < 180){
                this.rotate(1);
            }else{
                this.rotate(-1);
            }
        }else{
            this.x=this.path[0][0];
            this.y=this.path[0][1];
            this.path.splice(0,1);
        }
        if(this.path.length<1){
            this.eat(this.target);
        }

    }
    searchfood(){
        var possiblefood=new Array();
        for(var e=0;e<entities.length;e++){
            var food=entities[e];
            if(food.constructor.name=="Food"){
                var distance=this.distanceTo(food);
                if(distance<=this.searchradius){
                    possiblefood.push([distance,e]);
                }

            }
        }
        if(possiblefood.length>0){
            var e=possiblefood.sort(sortFunction)[0][1];
            food=entities[e];
            this.target=food;
        }else{
            this.wait=50;
        }

    }
    divide(){
        this.size=this.defaultsize;
        var clone=new Microbe();
        clone.x=this.x+5;
        clone.y=this.y+5;
        clone.color=this.color;
        entities.push(clone);
    }
    eat(food){
        food.life=0;
        this.looseTarget();
        this.life=this.defaultlife;
        this.size+=1;
        if(this.size>this.maxsize){
            this.divide();
        }
    }
    looseTarget(){
        this.target=0
        this.path=[]
        this.targetangle=0;
    }
    tick(){
        if(this.dying){
            this.dying--;
            this.color="#555555";
            if(this.dying % 5==0){
                this.y++;
            }
            if(this.dying<=0){
                return false
            }
            return true;
        }
        this.life--;
        if(this.life<=0){
            this.dying=100;
        }
        if(this.wait>0){
            this.wait--;
            return true;
        }
        if(this.target){
            if(this.target.life>0){
                this.travel();
            }else{
                this.looseTarget();
            }
        }else{
            this.searchfood();

        }
        return true;
    }
}
class Food extends Entity{
    constructor(x=null,y=null){
        super(x,y);
        this.color="#FFFFFF";
        this.size=2
    }
    draw(){

        ctx.setLineDash([]) //disable dashing
        ctx.beginPath(); //start new path
        ctx.fillStyle=this.color; //set color
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
}
function feed(event){
    entities.push(new Food(event.pageX,event.pageY));
}
function draw(fps, counter){
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(e in entities){
        entities[e].draw();
    }
    ctx.fillStyle = "yellow";
    ctx.font = "12px Arial";
    ctx.fillText("fps:"+fps,10,30);
    ctx.fillText("ticks:"+counter,10,50);
}
function tick(counter){
    for(e in entities){
        if(!entities[e].tick()){
            entities.splice(e,1);
        }
    }
    if(counter % 50==0){
        entities.push(new Food());
    }
}
window.onload = function () { main(); }

var canvas = document.getElementById("microbes");
var ctx = canvas.getContext("2d");
var entities=[];
function main(){
    canvas.addEventListener("mousedown",feed);
    //var con={};
    //con.canvas=canvas;
    //con.ctx=ctx;
    //con.entities=entities;
    draw();
    for(i=0;i<numMicrobes;i++){
        entities.push(new Microbe());
    }
    var counter=0;
    var fps=0;
    var od = new Date().getTime();
    var osec = new Date().getTime();
    var ofps=0;
    loop();
    function loop(){
        var d = new Date().getTime();
        if(od+(1000/10000)<=d){
            counter++;
            od=d;
            tick(counter);
            draw(ofps, counter);
        }
        if(osec+1000<=d){
            osec=d;
            osec=Math.floor(osec/1000)*1000
            ofps=fps;
            fps=0;
        }
        fps+=1;
        requestAnimationFrame(loop);
    }
}

