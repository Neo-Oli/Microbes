class Entity{
    constructor(ui) {
        this.ui=ui;
        this.color=[255,0,0];
        this.setRandomPos();
        this.fullhealth=2000
        this.health=this.fullhealth;
        this.size=2;
        this.angle=0;
    }
    save(){
        var obj=this;
        delete obj.ui;
        return obj;
    }
    setRandomPos(nearx=null,neary=null,near=0){
        var p=this.randompos(nearx,neary,near);
        this.x=p[0];
        this.y=p[1];
    }
    randompos(nearx=null,neary=null,near=0){
        if(nearx!==null){
            var x=this.getRandomInt(nearx-near,nearx+near)
        }else{
            var x=Math.floor(Math.random() * this.ui.canvas.width);
        }
        if(neary!==null){
            var y=this.getRandomInt(neary-near,neary+near)
        }else{
            var y=Math.floor(Math.random() * this.ui.canvas.height);
        }
        return [x,y];
    }
    draw(){

    }
    random(max,min=0,pow=1){
        return Math.round(Math.pow(Math.random(),pow) * (max - min) + min);
    }
     getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
    }
    line(x0, y0, x1, y1){
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
    convertColor(color, opacity=1){
        return "hsla("+color[0]+","+color[1]+"%,"+color[2]+"%,"+opacity+")";
    }
    rotate(step){
        var old=step;
        if(step<0){
            step=Math.floor(step);
        }else{
            step=Math.ceil(step);
        }
        this.ui.debugvar=[old,step];
        var newangle=this.angle+step;

        this.angle=this.positiveAngle(newangle);
    }
    distanceTo(e){
        var a=this.x - e.x;
        var b=this.y - e.y;
        var csqrt=Math.pow(a,2) + Math.pow(b,2);
        var c=Math.pow(csqrt,1/2);
        return c;
    }
    positiveAngle(angle){
        while(angle>=360){
            angle=angle-360;
        }
        while(angle<0){
            angle=angle+360;
        }
        return angle;
    }
    tick(){
        this.health-=1;
        if(this.health<=0){
            return false;
        }
        return true;
    }
}
