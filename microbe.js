class Microbe extends Entity{
    constructor(ui){
        super(ui);
        this.target=null;
        this.targetangle=300;
        this.path=[];
        this.minsize=2
        this.size=4;
        this.maxsize=5;
        this.speed=10
        this.fullhealth=3000;
        this.health=this.fullhealth;
        this.wait=0;
        this.searchradius=100;
        this.dying=null;
        this.generation=0;
        this.mutatechance=1 //lower = more evolutions
        this.mutaterange=3 //range of evolution
        this.mutations=0;
        this.dyinglength=100;
        this.traveled=0;
        this.traveledlast=0;
        this.rotatebreak=10;


        this.defaultcolors=[
            [0,100,50],
            [120,100,50],
            [240,100,50],
            [60,100,50],
        ];
        this.maxh=360;
        this.minh=0;
        this.suph=10;
        this.maxs=100;
        this.mins=25;
        this.sups=10;
        this.maxl=100;
        this.minl=30;
        this.supl=10;
        this.getRandomColor();
    }
    save(){
        var obj=super.save();
        delete obj.target;
        delete obj.path;
        return obj;
    }
    mutate(){
        this.x+=this.size;
        this.generation+=1;
        this.fullhealth=this.mutateInt(this.fullhealth);
        this.maxsize=this.mutateInt(this.maxsize);
        this.minsize=this.mutateInt(this.minsize,2);
        this.speed=this.mutateInt(this.speed);
        this.mutatechance=this.mutateInt(this.mutatechance);
        this.mutaterange=this.mutateInt(this.mutaterange);
        this.rotatebreak=this.mutateInt(this.rotatebreak);
        this.searchradius=this.mutateInt(this.searchradius);
        this.color=this.mutateColor(this.color);

    }
    mutateColor(color){
        return [
            this.mutateInt(color[0],this.minh,this.maxh,this.suph, true),
            this.mutateInt(color[1],this.mins,this.maxs,this.sups),
            this.mutateInt(color[2],this.minl,this.maxl,this.supl),
        ]
    }
    mutateInt(value,min=1,max=100000000000,speedup=1,circular=false){
        var chance=this.mutatechance;
        var range=this.mutaterange*speedup;
        if(this.random(1,0,chance)){
            this.mutations++;
            var reach=this.random(range,0-range,chance)
            value+=reach;
            if(circular){
                while(value>max){
                    value=value-max;
                }
                while(value<min){
                    value=value+max;
                }
            }else{
                if(value<min){
                    value=min;
                    //illegal mutations are punished
                    this.fullhealth-=reach;
                }
                if(value>=max){
                    value=max;
                    //illegal mutations are punished
                    this.fullhealth-=reach;
                }
            }
        }
        return value;
    }
    getRandomColor(){
        this.color=this.defaultcolors[Math.floor(Math.random()*this.defaultcolors.length)];
    }
    draw(){
        if(this.ui.debug){
            //for(var pi in this.path){
            //var p=this.path[pi];
            //this.ui.ctx.fillStyle = "lime";
            //this.ui.ctx.fillRect(p[0],p[1],1,1);
            //}
            if(this.target && this.path.length>2){
                this.ui.ctx.strokeStyle="lime"; //set color
                this.ui.ctx.lineWidth=1;
                this.ui.ctx.beginPath();
                this.ui.ctx.moveTo(this.path[0][0],this.path[0][1]);
                this.ui.ctx.lineTo(this.path[this.path.length-1][0],this.path[this.path.length-1][1]);
                this.ui.ctx.stroke();
            }
        }
        this.ui.ctx.setLineDash([]) //disable dashing
        this.ui.ctx.beginPath(); //start new path
        this.ui.ctx.lineWidth=1;
        this.ui.ctx.strokeStyle=this.convertColor(this.color); //set color
        this.ui.ctx.ellipse(
            this.x, //x
            this.y, //y
            this.size, //radiusX
            this.size*1.6, //radiusY
            this.angle * Math.PI/180, //rotation
            0, //startAngle
            2 * Math.PI //endAngle
        );
        this.ui.ctx.stroke(); //actually draw
        this.ui.ctx.lineWidth=3;
        this.ui.ctx.strokeStyle=this.convertColor(this.color,0.5); //set color
        this.ui.ctx.ellipse(
            this.x, //x
            this.y, //y
            this.size+1, //radiusX
            this.size*1.6+1, //radiusY
            this.angle * Math.PI/180, //rotation
            0, //startAngle
            2 * Math.PI //endAngle
        );
        this.ui.ctx.stroke(); //actually draw
        this.ui.ctx.strokeStyle=this.convertColor(this.color,0.2); //set color
        this.ui.ctx.ellipse(
            this.x, //x
            this.y, //y
            this.size+2, //radiusX
            this.size*1.6+2, //radiusY
            this.angle * Math.PI/180, //rotation
            0, //startAngle
            2 * Math.PI //endAngle
        );
        this.ui.ctx.stroke(); //actually draw
        this.ui.ctx.fillStyle = "yellow";
        var p=this.rotatepoint(this.x,this.y-this.size,this.angle,this.x,this.y)
        this.ui.ctx.fillRect(p[0],p[1],1,1);
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
        this.path=this.line(this.x,this.y,this.target.x,this.target.y);

        this.targetangle = Math.atan2(this.y - this.target.y, this.x - this.target.x) * 180 / Math.PI;
        this.targetangle = Math.round(this.positiveAngle(this.targetangle-90));
    }
    travel(){
        if(!this.path.length){
            this.searchpath()
        }
        if(this.targetangle!=this.angle){
            if((this.targetangle - this.angle + 360) % 360 < 180){
                this.rotate(this.speed/this.rotatebreak);
                if((this.targetangle - this.angle + 360) % 360 > 180){
                    this.angle=this.targetangle
                }
            }else{
                this.rotate(-this.speed/this.rotatebreak);
                if((this.targetangle - this.angle + 360) % 360 < 180){
                    this.angle=this.targetangle
                }
            }
        }else{
            var distance=this.speed/this.ui.speedmod;
            distance=distance*Math.pow(this.size,-0.1)
            this.traveledlast=distance
            this.traveled+=distance;
            this.health-=distance;
            var step=Math.floor(this.traveled);
            if(step>=this.path.length-1){
                step=this.path.length-1;
                this.x=this.path[step][0];
                this.y=this.path[step][1];
                this.eat(this.target);
            }else{
                if(this.path[step]){
                    this.x=this.path[step][0];
                    this.y=this.path[step][1];
                }else{
                    console.log("Target has disappeared");
                    this.looseTarget();
                }
            }
        }
    }
    getsouroundings(entities){
        var surroundings=[];
        for(var e=0;e<entities.length;e++){
            entity=entities[e];
            if(
                entity.x>this.x-this.searchradius &&
                entity.x<this.x+this.searchradius &&
                entity.y>this.y-this.searchradius &&
                entity.y<this.y+this.searchradius
            ){
                surroundings+=entity;
            }
        }
    }
    searchfood(){
        var possiblefood=new Array();
        for(var e=0;e<this.ui.foods.length;e++){
            var food=this.ui.foods[e];
            if(food.constructor.name=="Food"){
                var distance=this.distanceTo(food);
                if(distance<=this.searchradius){
                    possiblefood.push([distance,e]);
                }
            }
        }
        if(possiblefood.length>0){
            var e=possiblefood.sort(function(a, b) {
                if (a[0] === b[0]) {
                    return 0;
                }
                else {
                    return (a[0] < b[0]) ? -1 : 1;
                }
            })[0][1]
            food=this.ui.foods[e];
            this.target=food;
        }else{
            var p=this.randompos(this.x,this.y,50);
            this.target={"x": p[0],"y": p[1],"health":1};
        }
    }
    divide(){
        this.size=Math.floor(this.size/2);
        var clone=Object.assign(new Microbe(this.ui),this)
        clone.mutate()
        this.ui.microbes.push(clone);
        this.ui.checkAchievements();
    }
    die(){
        this.dying=this.dyinglength
        this.ui.checkAchievements();
    }
    eat(food){
        food.health=0;
        this.looseTarget();
        if(food.constructor.name!="Food"){
            //random target
            return
        }
        this.health=this.fullhealth;
        this.size+=1;
        if(this.size>this.maxsize&&this.size/2>this.minsize){
            this.divide();
        }
    }
    looseTarget(){
        this.target=0
        this.path=[]
        this.traveled=0;
        this.targetangle=0;
    }
    tick(){
        if(this.dying){
            this.dying--;
            this.color=[0,0,33];
            if(this.dying % 5==0){
                this.y++;
            }
            if(this.dying<=0){
                return false
            }
            return true;
        }
        this.health--;
        if(this.health<=0){
            //if(random(1,0,this.badluck)==0&&this.size>this.minsize){
            if(this.size>this.minsize){
                this.size--;
                this.health=Math.floor(this.fullhealth/2);
            }else{
                this.die();
            }
        }
        if(this.wait>0){
            this.wait--;
            return true;
        }
        if(this.target){
            if(this.target.health>0){
                this.travel();
            }else{
                this.looseTarget();
            }
        }else{
            this.searchfood();
        }
        return true;
    }
    randompos(nearx=null,neary=null,near=0){
        var p=super.randompos(nearx, neary, near);
        var x=p[0];
        var y=p[1]
        if(x<0){x=0;}
        if(x>=this.ui.canvas.width){x=this.ui.canvas.width-1;}
        if(y>=this.ui.canvas.height){y=this.ui.canvas.height-1;}
        if(y<0){y=0;}
        return [x,y];

    }
}

