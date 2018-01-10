"use strict";
class Microbes{
    constructor(id){

        this.debug=false;
        this.numMicrobes=4;
        this.foodmod=500
        this.feedvol=5;
        this.manualfed=0;
        this.autofed=0;
        this.feedspread=5;
        this.tps=100;
        this.debugvar=null;
        this.speedmod=50;
        this.counter;
        this.deaths=0;
        this.frameskip=1;
        this.width=0;
        this.height=0;
        this.achievements=new Array();
        this.achievementQ=new Array();
        this.achievementElement;
        this.achievementElementName;
        this.achievementElementBlurb;
        this.achievementDisplaytime=0;
        this.menuAchievementsElement;




        var ui=this;

        this.container=document.getElementById(id);
        var html="";
        html+='<div class="menutrigger">⚙</div>';
        html+='<div class="menu">';
        html+="<h3>Autofeed</h3>";
        html+='<label>less food</label><label>more food</label><input type="range" min="-250" max="500" class="slider reversed" id="foodmodslider" data-variable="foodmod"><div class="reset" data-target="foodmodslider">⟲</div>';
        //html+='<label>slower</label><label>faster</label><input type="range" min="10" max="5000" class="slider" id="tpsslider" data-variable="tps"><div class="reset" data-target="tpsslider">⟲</div>';
        html+='<h2>Achievements</h2>';
        html+='<div class="achievements"></div>';
        html+='<div class="stats"></div>';
        html+='</div>';
        html+='<canvas id="microbes" width="200" height="100">';
        html+='Your browser does not support the canvas element.';
        html+='</canvas>';
        html+='<div id="achievement">';
        html+='<div class="title">Achievement unlocked</div>';
        html+='<div class="name">null</div>';
        html+='<div class="blurb">null</div>';
        html+='</div>';

        this.container.innerHTML=html;
        var inputs=this.container.querySelectorAll("input");

        for(var i=0;i<inputs.length;i++){
            var element=inputs[i];
            element.value=this[element.getAttribute('data-variable')];
            element.setAttribute("data-default",element.value);
            element.addEventListener("change",function(e){
                element=e.originalTarget;
                var variable=element.getAttribute('data-variable');
                ui[variable]=parseInt(element.value);
            });
        }

        var resets=this.container.querySelectorAll(".reset");
        for(i=0;i<resets.length;i++){
            element=resets[i];
            element.addEventListener("click",function(e){
                element=e.originalTarget;
                var target=element.getAttribute('data-target');
                target=ui.container.querySelector("#"+target);
                var defaultvalue=parseInt(target.getAttribute("data-default"));
                target.value=defaultvalue;
                var variable=target.getAttribute('data-variable');
                ui[variable]=defaultvalue;
            });
        }

        this.container.classList.add("microbescontainer");
        this.canvas = this.container.querySelector("canvas");
        this.stats = this.container.querySelector(".stats");
        var menutrigger = this.container.querySelector(".menutrigger");
        this.ctx = this.canvas.getContext("2d");
        this.microbes=[];
        this.foods=[];
        this.counter=0;
        this.canvas.addEventListener("mousedown",function(event){
            for(var i=0;i<ui.feedvol;i++){
                var food=new Food(ui);
                var p=food.randompos(event.pageX,event.pageY, ui.feedspread);
                food.x=p[0];
                food.y=p[1];
                ui.foods.push(food);
                ui.manualfed++;
            }
        });
        menutrigger.addEventListener("click",function(e){
            ui.container.classList.toggle("menushown");
        });
        this.setupAchievements();
    }

    setupAchievements(){
        var ui=this;
        this.achievementElement=this.container.querySelector("#achievement");
        this.achievementElementName=this.achievementElement.querySelector(".name");
        this.achievementElementBlurb=this.achievementElement.querySelector(".blurb");
        this.menuAchievementsElement=this.container.querySelector(".achievements");
        this.achievements.push("Microbes");
        this.achievements.push(new Achievement(this,"Cell Division", "Out of one make two." ,function(){return ui.microbes.length>ui.numMicrobes}));
        this.achievements.push(new Achievement(this,"Get 10 microbes at the same time", "It's starting to look like a party." ,function(){return ui.microbes.length>=10}));
        this.achievements.push(new Achievement(this,"Get 100 microbes at the same time", "" ,function(){return ui.microbes.length>=100}));
        this.achievements.push(new Achievement(this,"Get 200 microbes at the same time", "" ,function(){return ui.microbes.length>=200}));
        this.achievements.push(new Achievement(this,"Get 300 microbes at the same time", "" ,function(){return ui.microbes.length>=300}));
        this.achievements.push(new Achievement(this,"Get 500 microbes at the same time", "" ,function(){return ui.microbes.length>=500}));
        this.achievements.push(new Achievement(this,"Get 1000 microbes at the same time", "This is too many." ,function(){return ui.microbes.length>=1000}));
        this.achievements.push("Feeding");
        this.achievements.push(new Achievement(this,"Feed 100 times", "Fed microbes are happy microbes" ,function(){return ui.manualfed>=100}));
        this.achievements.push(new Achievement(this,"Have a 100 items of Food", "Food is the most important meal of the day" ,function(){return ui.foods.length>=100}));
        this.achievements.push(new Achievement(this,"Have a 1000 items of Food", "A Feast!" ,function(){return ui.foods.length>=1000}));
        this.achievements.push("Deaths");
        this.achievements.push(new Achievement(this,"First Death", "Rest in peace, little buddy! :(" ,function(){return ui.deaths>=1}));
        this.achievements.push(new Achievement(this,"10 Deaths", "It hurts a little less each time" ,function(){return ui.deaths>=10}));
        this.achievements.push(new Achievement(this,"100 Deaths", "Tja" ,function(){return ui.deaths>=100}));
        this.achievements.push(new Achievement(this,"1000 Deaths", "Die you stupid circles!" ,function(){return ui.deaths>=1000}));
        this.achievements.push(new Achievement(this,"10000 Deaths", "You're a monster!" ,function(){return ui.deaths>=10000}));
        this.checkAchievements();
        this.displayAchievements();
        this.menuAchievements();
    }
    checkAchievements(){
        for(var i=0;i<this.achievements.length;i++){
            if(this.achievements[i].constructor.name=="Achievement"){
                var result=this.achievements[i].check();
            }
        }
    }
    displayAchievements(){
        if(this.achievementDisplaytime>0){
            this.achievementDisplaytime--;
            if(this.achievementDisplaytime<1){
                this.achievementElement.classList.remove("visible");
            }
            return false;
        }

        var a=this.achievementQ[0];
        if(a){
            this.achievementElementName.innerHTML=a.name;
            this.achievementElementBlurb.innerHTML=a.blurb;
            this.achievementElement.classList.add("visible");
            this.achievementDisplaytime=5;
            this.achievementQ.shift();
            this.menuAchievements();
        }
    }
    menuAchievements(){
        var allhtml="";
        for(var i=0;i<this.achievements.length;i++){
            var a=this.achievements[i];
            var html="";
            if(a.constructor.name=="Achievement"){
                var done="";
                if(a.done){
                    done="done";
                }
                html+='<div class="menuAchievement '+done+'">';
                html+='<div class="menuAchievementName">'+a.name+'</div>';
                html+='</div>';
            }else{
                html='<div class="menuAchievementsTitle">'+a+'</div>';
            }
            allhtml+=html;
        }
        this.menuAchievementsElement.innerHTML=allhtml;
    }





    draw(){
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for(var e in this.foods){
            this.foods[e].draw();
        }
        for(var e in this.microbes){
            this.microbes[e].draw();
        }


    }
    updateCanvas(){
        var newWidth=this.canvas.offsetWidth;
        var newHeight=this.canvas.offsetHeight
        if(this.width!=newWidth || this.height!=newHeight){
            this.canvas.width = this.canvas.offsetWidth;
            this.canvas.height = this.canvas.offsetHeight;
            this.width=newWidth;
            this.height=newHeight;
        }
    }
    drawstats(fps, counter,ticks,maxspeedstats){
        var html="";
        html+=this.statline("fps",fps);
        html+=this.statline("ticks",counter);
        html+=this.statline("ticks/s",ticks);
        html+=this.statline("foods",this.foods.length);
        html+=this.statline("Food Chance",this.foodchance());
        if(this.debugvar!==null){
            html+=this.statline("debugvar",debugvar);
        }
        html+=this.statline("alive",this.microbes.length);
        html+=this.statline("deaths",this.deaths);
        html+=this.statline("total",this.deaths+this.microbes.length);
        html+=this.statlineMinMax(this.microbes,"generation");
        html+=this.statlineMinMax(this.microbes,"mutations");
        html+=this.statlineMinMax(this.microbes,"fullhealth");
        html+=this.statlineMinMax(this.microbes,"size");
        html+=this.statlineMinMax(this.microbes,"minsize");
        html+=this.statlineMinMax(this.microbes,"maxsize");
        html+=this.statlineMinMax(this.microbes,"speed");
        html+=this.statlineMinMax(this.microbes,"mutatechance");
        html+=this.statlineMinMax(this.microbes,"mutaterange");
        html+=this.statlineMinMax(this.microbes,"traveledlast");
        html+=this.statlineMinMax(this.microbes,"rotatebreak");
        html+=this.statlineMinMax(this.microbes,"searchradius");
        this.stats.innerHTML=html;
    }
    statline(key,val){
        return key+": "+val+"<br>";
    }
    statlineMinMax(obj,key){
        var min=0;
        var max=0;
        var sorted=obj.sort(function(a, b){
            var av=a[key];
            var bv=b[key];
            if(av < bv) return -1;
            if(av > bv) return 1;
            return 0;
        });
        if(sorted[0]){
            min=sorted[0][key];
            max=sorted[sorted.length-1][key];
        }
        return key+": min="+min+";max="+max+"<br>";
    }
    tick(counter){
        for(var e in this.microbes){
            if(!this.microbes[e].tick()){
                this.deaths+=1;
                this.microbes.splice(e,1);
            }
        }
        for(var e in this.foods){
            if(!this.foods[e].tick()){
                this.foods.splice(e,1);
            }
        }
        if(counter % this.foodchance()==0 && this.manualfed>0){
            this.foods.push(new Food(this));
            this.autofed++;
        }
    }
    foodchance(){
        var res=this.microbes.length;
        res+=this.foods.length/2
        res+=this.foodmod;
        if(res<1){res=1;}
        return Math.floor(res);
    }
    play(){
        this.updateCanvas();
        this.draw();
        for(var i=0;i<this.numMicrobes;i++){
            var microbe=new Microbe(this);
            if(microbe.defaultcolors[i]){
                microbe.color=microbe.defaultcolors[i]
                microbe.health=999999999999;
            }
            this.microbes.push(microbe);
        }
        this.microbes[0].x=Math.floor(this.width/2);
        this.microbes[0].y=Math.floor(this.height/2);

        var fps=0;
        var start = new Date().getTime();
        var od=start
        var osec = start
        var atps=this.tps; // actual tps
        var ticks=0;
        //var speedstep=1;
        //var speedvelocity=1;
        //var fpsstats=[]
        //var fpsfuzzy=10
        //var missed=0;
        //var safespeed=tps;
        //var emergencystops=0;
        //var loopcounter=0;
        var work=0;
        //for(i=0;i<fpsfuzzy;i++){
        //fpsstats.push(60);
        //}
        var ui=this
        loop();
        graphicsloop();
        function loop(){
            //loopcounter+=1;
            var d = new Date().getTime();
            target=(d-od)*(atps/1000);
            work+=target % 1


            var target=Math.floor(target)
            if(target>atps){
                //console.log("Emergency stop. Tried to catch up "+target+" ticks. "+work+" ticks scheduled");
                target=atps;
            }
            if(work>=1){
                target=target+work
                target=Math.floor(target)
                work-=1;
            }
            for(i=0;i<target;i++){
                ui.counter++;
                ticks++;
                ui.tick(ui.counter);
                if(i>atps){
                    work+=target-i;
                    console.log("target overflow");
                    break
                }
            }
            od=d;

            if(osec+1000<=d){
                atps=ui.tps
                //missed=atps-ticks;
                //while(ticks<atps){
                //action();
                //}
                osec=d;
                //fpsstats.push(fps);
                //fpsstats.shift();
                //ofps=Math.round(fpsstats.reduce((a,b){return a+b})/fpsfuzzy);
                //if(ofps>=minfps-5){
                //safespeed=atps;
                //}
                ui.drawstats(fps, ui.counter, ticks);
                fps=0;
                ticks=0;
                ui.displayAchievements();
                ui.updateCanvas();
                //if(maxspeed){
                //if(speedvelocity==2||speedvelocity==-2){
                //speedstep*=2;
                //}else {
                //speedstep=Math.ceil(speedstep/2);
                //}
                //if(ofps>=minfps){
                //if(speedvelocity<-1){
                //speedstep=Math.ceil(speedstep/2);
                //atps+=speedstep;
                //speedvelocity=-1
                //}
                //atps+=speedstep;

                //speedvelocity++;
                //}else if(ofps<minfps){
                //if(speedvelocity>1){
                //speedstep=Math.ceil(speedstep/2);
                //speedstep=Math.ceil(speedstep/2);
                //speedvelocity=1
                //}
                //atps-=speedstep;

                //speedvelocity--;
                //if(atps<100){
                //atps=safespeed;
                //speedstep=1024;
                //speedvelocity=0;
                //safespeed/=2;
                //emergencystops++;
                //}
                //}else{
                //speedvelocity=0;
                //}
                //if(speedvelocity<-2){speedvelocity=-2;}
                //if(speedvelocity> 2){speedvelocity= 2;}
                //maxspeedstat="";
                //maxspeedstat+=this.statline("tps",atps);
                //maxspeedstat+=this.statline("speedstep",speedstep);
                //maxspeedstat+=this.statline("safespeed",safespeed);
                //maxspeedstat+=this.statline("Target FPS",minfps);
                //maxspeedstat+=this.statline("emergency stops",emergencystops);
                //}else{
                //maxspeedstat=""
                //atps=tps;
                //}
                //updateCanvas();
            }
            //if(loopcounter % frameskip==0){
            //if(osec+30<=d){
            //draw();
            //fps+=1;
            //}
            setTimeout(loop,10);
            //requestAnimationFrame(loop);
        }
        function graphicsloop(){
            var d = new Date().getTime();
            if(osec+1000<=d){
                ui.updateCanvas();
            }
            ui.draw();
            fps+=1;
            requestAnimationFrame(graphicsloop);
        }
    }
    masterrace(){
        i=new Microbe(this);
        i.speed=1000;
        i.searchradius=1000;
        this.microbes[0]=i;
        return i;
    }
}

var game=new Microbes("microbes1")
window.onload =  function() { game.play(); }
