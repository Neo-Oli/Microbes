class Microbe extends Entity{
    constructor(x=null,y=null){
        super(x,y);
        this.getRandomColor();
        this.target=null;
        this.targetangle=300;
        this.path=[];
        this.minsize=2
        this.size=this.minsize;
        this.maxsize=5;
        this.speed=10
        this.fullhealth=2000;
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
        checkAchievements();

    }
    mutateColor(color){
        return [
            this.mutateInt(color[0],mincolor,maxcolor,colorspeedup),
            this.mutateInt(color[1],mincolor,maxcolor,colorspeedup),
            this.mutateInt(color[2],mincolor,maxcolor,colorspeedup),
        ]
    }
    mutateInt(value,min=1,max=100000000000,speedup=1){
        var chance=this.mutatechance;
        var range=this.mutaterange*speedup;
        if(random(1,0,chance)){
            this.mutations++;
            var reach=random(range,0-range,chance)
            value+=reach;
            if(value<min){
                value=min;
                //illegal mutations are punished
                this.fullhealth-=reach;
            }
            if(value>max){
                value=max;
                //illegal mutations are punished
                this.fullhealth-=reach;
            }
        }
        return value;
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
        ctx.strokeStyle=this.convertColor(this.color); //set color
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
            var distance=this.speed/speedmod;
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
        for(var e=0;e<foods.length;e++){
            var food=foods[e];
            if(food.constructor.name=="Food"){
                var distance=this.distanceTo(food);
                if(distance<=this.searchradius){
                    possiblefood.push([distance,e]);
                }
            }
        }
        if(possiblefood.length>0){
            var e=possiblefood.sort(sortFunction)[0][1];
            food=foods[e];
            this.target=food;
        }else{
            var p=this.randompos(this.x,this.y,50);
            this.target={"x": p[0],"y": p[1],"health":1};
        }
    }
    divide(){
        this.size=Math.floor(this.size/2);
        var clone=Object.assign(new Microbe,this)
        clone.mutate()
        microbes.push(clone);
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
            this.color=[85,85,85];
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
                this.dying=this.dyinglength
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
}

