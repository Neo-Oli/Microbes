
class Ui{
    constructor(id,controller,dontload=false){
        this.controller=controller;
        this.id=id;
        this.debug=false;
        this.numMicrobes=4;
        this.foodmod=500
        this.feedvol=5;
        this.feedspread=5;
        this.tps=100;
        this.debugvar=null;
        this.speedmod=50;
        this.frameskip=1;
        this.width=0;
        this.height=0;
        this.achievements={};
        this.achievementQ=new Array();
        this.achievementElement;
        this.achievementElementName;
        this.achievementElementBlurb;
        this.achievementDisplaytime=0;
        this.menuAchievementsElement;
        this.stats={};
        this.stats.deaths=0;
        this.stats.counter=0;
        this.stats.manualfed=0;
        this.stats.autofed=0;
        this.welcometexthidden=false
        this.savetime=new Date().getTime();

        var ui=this;

        this.container=document.getElementById(id);
        var html="";
        html+='<div class="microbes-menutrigger">⚙</div>';
        html+='<div class="microbes-menu">';
        html+='<div class="microbes-menu-container">';
        html+='<div class="microbes-menu-title">Menu</div>';
        html+='<div class="mircobes-sub-title">Autofeed</div>';
        html+='<label>less food</label><label>more food</label><input type="range" min="-250" max="500" class="microbes-slider microbes-reversed" id="microbes-foodmodslider" data-variable="foodmod"><div class="microbes-reset" data-target="microbes-foodmodslider">⟲</div>';
        //html+='<label>slower</label><label>faster</label><input type="range" min="10" max="5000" class="slider" id="tpsslider" data-variable="tps"><div class="reset" data-target="tpsslider">⟲</div>';
        html+='<div class="microbes-button microbes-pausegame">Pause Game</div>';
        html+='<div class="microbes-button microbes-playgame microbes-button-hidden">Play Game</div>';
        html+='<div class="microbes-button microbes-resetgame">Reset Game</div>';
        html+='<div class="mircobes-sub-title">Achievements</div>';
        html+='<div class="microbes-achievements"></div>';
        html+='<div class="mircobes-sub-title">Statistics</div>';
        html+='<div class="microbes-stats"></div>';
        html+='</div>';
        html+='</div>';
        html+='<canvas>';
        html+='Your browser does not support the canvas element.';
        html+='</canvas>';
        html+='<div id="microbes-welcometext">Hi, feed us please :(</div>';
        html+='<div id="microbes-deathmenu" class="microbes-popup">';
        html+='<div class="microbes-menu-title">';
        html+='All microbes have died :(';
        html+='</div>';
        html+='</div>';

        html+='<div id="microbes-achievement">';
        html+='<div class="microbes-achievement-icon">ICON</div>';
        html+='<div class="microbes-achievement-title">Achievement unlocked</div>';
        html+='<div class="microbes-achievement-name">null</div>';
        html+='<div class="microbes-achievement-blurb">null</div>';
        html+='</div>';

        html+='<div id="microbes-oversavedmenu" class="microbes-popup">';
        html+='<div class="microbes-menu-title">';
        html+='You have opened the game in another tab.';
        html+='</div>';
        html+='<div class="microbes-button microbes-startgame">Play here</div>';
        html+='</div>';



        this.container.innerHTML=html;
        var inputs=this.container.querySelectorAll("input");

        for(var i=0;i<inputs.length;i++){
            var element=inputs[i];
            element.value=this[element.getAttribute('data-variable')];
            element.setAttribute("data-default",element.value);
            element.addEventListener("change",function(e){
                element=e.target;
                var variable=element.getAttribute('data-variable');

                ui[variable]=parseInt(element.value);
            });
        }

        var resets=this.container.querySelectorAll(".microbes-reset");
        for(var i=0;i<resets.length;i++){
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
        var elements=this.container.querySelectorAll(".microbes-resetgame");
        for(var i=0;i<elements.length;i++){
            element=elements[i];
            element.addEventListener("click",function(e){
                if(ui.microbes.length<=0 || ui.question("Are you sure you want to reset your game? This will also reset all you achievements")){
                    ui.controller.reset();
                }
            });
        }

        var elements=this.container.querySelectorAll(".microbes-pausegame");
        for(var i=0;i<elements.length;i++){
            element=elements[i];
            element.addEventListener("click",function(e){
                ui.controller.stop();
                var buttons=ui.container.querySelectorAll(".microbes-pausegame")
                for(var l=0;l<buttons.length;l++){
                    buttons[l].classList.add("microbes-button-hidden");
                }
                var buttons=ui.container.querySelectorAll(".microbes-playgame")
                for(var l=0;l<buttons.length;l++){
                    buttons[l].classList.remove("microbes-button-hidden");
                }
            });
        }
        var elements=this.container.querySelectorAll(".microbes-playgame");
        for(var i=0;i<elements.length;i++){
            element=elements[i];
            element.addEventListener("click",function(e){
                ui.controller.play();
                var buttons=ui.container.querySelectorAll(".microbes-pausegame")
                for(var l=0;l<buttons.length;l++){
                    buttons[l].classList.remove("microbes-button-hidden");
                }
                var buttons=ui.container.querySelectorAll(".microbes-playgame")
                for(var l=0;l<buttons.length;l++){
                    buttons[l].classList.add("microbes-button-hidden");
                }
            });
        }

        var elements=this.container.querySelectorAll(".microbes-startgame");
        for(var i=0;i<elements.length;i++){
            element=elements[i];
            element.addEventListener("click",function(e){
                ui.save(true);
                ui.container.querySelector("#microbes-oversavedmenu").classList.remove("microbes-popupshown");
                ui.controller.play();

            });
        }

        this.container.classList.add("microbes-container");
        this.canvas = this.container.querySelector("canvas");
        this.menustats = this.container.querySelector(".microbes-stats");
        var menutrigger = this.container.querySelector(".microbes-menutrigger");
        this.ctx = this.canvas.getContext("2d");
        this.microbes=[];
        this.foods=[];
        this.stats.counter=0;
        this.canvas.addEventListener("mousedown",function(event){
            if(ui.controller.playing){
                for(var i=0;i<ui.feedvol;i++){
                    var food=new Food(ui);
                    var p=food.randompos(event.layerX,event.layerY, ui.feedspread);
                    food.x=p[0];
                    food.y=p[1];
                    ui.foods.push(food);
                    ui.stats.manualfed++;
                }
            }
        });
        menutrigger.addEventListener("click",function(e){
            ui.container.classList.toggle("microbes-menushown");
        });
        this.setupAchievements();
        this.updateCanvas();
        this.draw();
        if(!dontload){
            this.load();
        }else{
            this.defaultMicrobes();
            this.save(true);
        }
    }
    question(text){
        return confirm(text);
    }
    save(oversave=false){
        if (typeof(Storage) !== "undefined") {
            var oldobj=JSON.parse(localStorage.getItem("MicrobesSave_"+this.id));
            if(oldobj&&oldobj.savetime>this.savetime && !oversave){
                this.overSaved();
                return;
            }

            var obj={};
            obj.microbes=[];
            //microbes
            for(var e in this.microbes){
                var clone=Object.assign(new Microbe(this),this.microbes[e]);
                obj.microbes.push(clone.save());
            }
            //foods
            obj.foods=[];
            for(var e in this.foods){
                var clone=Object.assign(new Food(this),this.foods[e]);
                obj.foods.push(clone.save());
            }
            //achievements
            obj.achievements={};
            for(var e in this.achievements){
                if(this.achievements[e].constructor.name=="Achievement"){
                    obj.achievements[e]=this.achievements[e].done;
                }
            }
            obj.stats=this.stats;
            this.savetime=new Date().getTime();
            obj.savetime=this.savetime;
            localStorage.setItem("MicrobesSave_"+this.id, JSON.stringify(obj));
            //localStorage.setItem("MicrobesSave_"+this.id, JSON.stringify(obj,function(key, val) {
            //if (val != null && typeof val == "object") {
            //if (seen.indexOf(val) >= 0) {
            //return;
            //}
            //seen.push(val);
            //}
            //return val;
            //}));
        } else {
            console.log("Your browser doesn't support save/load");
        }
    }
    load(){
        if (typeof(Storage) !== "undefined") {
            var obj=JSON.parse(localStorage.getItem("MicrobesSave_"+this.id));
            if(!obj){

                this.defaultMicrobes();
                return
            }
            for(var e in obj.achievements){
                var achievement=obj.achievements[e];
                if(this.achievements[e]){
                    this.achievements[e].done=obj.achievements[e];
                }
                this.menuAchievements();
            } for(var e in obj.microbes){
                var microbe=obj.microbes[e];
                microbe=Object.assign(new Microbe(this),microbe);
                if(microbe.x>=this.width || microbe.y>=this.height ){
                    microbe.setRandomPos();
                }
                this.microbes.push(microbe);
            }
            if(this.microbes.length<=0){
                this.defaultMicrobes();
                return
            }
            for(var e in obj.foods){
                var food=obj.foods[e];
                food=Object.assign(new Food(this),food);
                this.foods.push(food);
            }






            this.stats=Object.assign(this.stats,obj.stats);
            this.save();

        } else {
            console.log("Your browser doesn't support save/load");
            this.defaultMicrobes();
        }
    }
    defaultMicrobes(){
        for(var i=0;i<this.numMicrobes;i++){
            var microbe=new Microbe(this);
            if(microbe.defaultcolors[i]){
                microbe.color=microbe.defaultcolors[i]
                microbe.health=999999999999;
                microbe.setRandomPos(this.width/2,this.height/2,50)
            }
            this.microbes.push(microbe);
        }
    }
    setupAchievements(){
        var ui=this;
        this.achievementElement=this.container.querySelector("#microbes-achievement");
        this.achievementElementName=this.achievementElement.querySelector(".microbes-achievement-name");
        this.achievementElementBlurb=this.achievementElement.querySelector(".microbes-achievement-blurb");
        this.achievementElementIcon=this.achievementElement.querySelector(".microbes-achievement-icon");
        var m='<span class="microbe-microbe-icon">0</span>';
        this.menuAchievementsElement=this.container.querySelector(".microbes-achievements");
        this.addAchievement("a1","Microbes");
        this.addAchievement("a2",new Achievement(this,m+" "+m, "Cell Division", "Out of one make two." ,function(){return ui.microbes.length>ui.numMicrobes}));
        this.addAchievement("a3",new Achievement(this,m+"<br>10", "Get 10 microbes at the same time", "It's starting to look like a party." ,function(){return ui.microbes.length>=10}));
        this.addAchievement("a4",new Achievement(this,m+"<br>100", "Get 100 microbes at the same time", "" ,function(){return ui.microbes.length>=100}));
        this.addAchievement("a5",new Achievement(this,m+"<br>200", "Get 200 microbes at the same time", "" ,function(){return ui.microbes.length>=200}));
        this.addAchievement("d0","Deaths");
        this.addAchievement("d1",new Achievement(this,"☠", "First Death", "Rest in peace, little buddy! :(" ,function(){return ui.stats.deaths>=1}));
        this.addAchievement("d2",new Achievement(this,"☠<br>10", "10 Deaths", "It hurts a little less each time" ,function(){return ui.stats.deaths>=10}));
        this.addAchievement("d3",new Achievement(this,"☠<br>100", "100 Deaths", "Tja" ,function(){return ui.stats.deaths>=100}));
        this.addAchievement("d4",new Achievement(this,"☠<br>1000", "1000 Deaths", "Die you stupid circles!" ,function(){return ui.stats.deaths>=1000}));
        this.addAchievement("d5",new Achievement(this,"☠<br>10000", "10000 Deaths", "You're a monster!" ,function(){return ui.stats.deaths>=10000}));
        this.addAchievement("f0","Feeding");
        this.addAchievement("f1",new Achievement(this,"•<br>100", "Have a 100 items of Food", "Food is the most important meal of the day" ,function(){return ui.foods.length>=100}));
        this.addAchievement("f2",new Achievement(this,"•<br>1000","Have a 1000 items of Food", "A Feast!" ,function(){return ui.foods.length>=1000}));
        this.addAchievement("f3",new Achievement(this,"⠲<br>100", "Feed 100 times", "Fed microbes are happy microbes" ,function(){return ui.stats.manualfed>=100}));
        this.addAchievement("f4",new Achievement(this,"⠲<br>1000", "Feed 1000 times", "Do you already know about the Slider?" ,function(){return ui.stats.manualfed>=1000}));
        this.addAchievement("f5",new Achievement(this,"⠲<br>10000", "Feed 10000 times", "Does your finger hurt now?" ,function(){return ui.stats.manualfed>=10000}));
        this.addAchievement("c4","Special Colors");
        this.addAchievement("c1",new Achievement(this,'<span style="color:#FFFFFF">'+m+'</span>', "Breed a white microbe", "Can't be seen in the snow." ,function(){for(var e in ui.microbes){if(ui.microbes[e].color[2]==100){return true;}}}));
        this.addAchievement("c2",new Achievement(this,'<span style="color:#C0FFEE">'+m+'</span>', "Breed a #C0FFEE colored microbe", "Is this one faster?" ,function(){for(var e in ui.microbes){if(ui.microbes[e].color.toString()==[164,100,88].toString()){return true;}}}));
        this.addAchievement("c3",new Achievement(this,'<span style="color:#BADA55">'+m+'</span>', "Breed a #BADA55 colored microbe", "This is the best microbe" ,function(){for(var e in ui.microbes){if(ui.microbes[e].color.toString()==[74,64,59].toString()){return true;}}}));
        this.displayAchievements();
        this.menuAchievements();
    }
    addAchievement(id,achievement){
        if(this.achievements[id]){
            throw "Duplicate Achievement "+id;
        }
        this.achievements[id]=achievement;
    }
    checkAchievements(){
        for(var i in this.achievements){
            if(this.achievements[i].constructor.name=="Achievement"){
                var result=this.achievements[i].check();
            }
        }
    }
    displayAchievements(){
        if(this.achievementDisplaytime>0){
            this.achievementDisplaytime--;
            if(this.achievementDisplaytime<1){
                this.achievementElement.classList.remove("microbes-visible");
            }
            return false;
        }

        var a=this.achievementQ[0];
        if(a){
            this.achievementElementName.innerHTML=a.name;
            var html="";
            html+='<div class="microbes-menuAchievement microbes-done">';
            html+='<div class="microbes-Achievement-icon">'+a.icon+"</div>";

            this.achievementElementIcon.innerHTML=html;
            this.achievementElementBlurb.innerHTML=a.blurb;
            this.achievementElement.classList.add("microbes-visible");
            this.achievementDisplaytime=5;
            this.achievementQ.shift();
            this.menuAchievements();
        }
    }
    menuAchievements(){
        var allhtml="";
        for(var i in this.achievements){
            var a=this.achievements[i];
            var html="";
            if(a.constructor.name=="Achievement"){
                var done="";
                if(a.done){
                    done="microbes-done";
                }
                html+='<div class="microbes-menuAchievement '+done+'">';
                html+='<div class="microbes-Achievement-icon">'+a.icon+"</div>";
                html+='<div class="microbes-menuAchievementName">'+a.name+'</div>';
                html+='</div>';
            }else{
                html='<div class="microbes-menuAchievementsTitle">'+a+'</div>';
            }
            allhtml+=html;
        }
        this.menuAchievementsElement.innerHTML=allhtml;
    }


    hidewelcometext(){
        if(!this.welcometexthidden){
            if(this.stats.manualfed>=1){
                this.welcometexthidden=true;
                this.container.querySelector("#microbes-welcometext").classList.add("microbes-hidden");
            }
        }
    }
    showDeathMenu(){
        if(this.microbes.length<=0){
            this.container.querySelector("#microbes-deathmenu").classList.add("microbes-popupshown");
        }
    }
    overSaved(){
        this.container.querySelector("#microbes-oversavedmenu").classList.add("microbes-popupshown");
        this.controller.stop();
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
        var newWidth=this.container.offsetWidth;
        var newHeight=this.container.offsetHeight
        if(this.width!=newWidth || this.height!=newHeight){
            this.canvas.width = newWidth;
            this.canvas.height = newHeight;
            this.width=newWidth;
            this.height=newHeight;
        }
    }
    drawstats(fps, ticks){
        var html="";
        if(this.debug){
            html+=this.statline("fps",fps);
            html+=this.statline("ticks",this.stats.counter);
            html+=this.statline("ticks/s",ticks);
            html+=this.statline("foods",this.foods.length);
            html+=this.statline("Food Chance",this.foodchance());
            if(this.debugvar!==null){
                html+=this.statline("debugvar",this.debugvar);
            }
        }
        html+=this.statline("Alive",this.microbes.length);
        html+=this.statline("Deaths",this.stats.deaths);
        html+=this.statline("Total",this.stats.deaths+this.microbes.length);
        html+=this.statlineMinMax(this.microbes,"generation", "Generations");
        html+=this.statlineMinMax(this.microbes,"size","Sizes");

        if(this.debug){
            html+=this.statlineMinMax(this.microbes,"mutations");
            html+=this.statlineMinMax(this.microbes,"fullhealth");
            html+=this.statlineMinMax(this.microbes,"minsize");
            html+=this.statlineMinMax(this.microbes,"maxsize");
            html+=this.statlineMinMax(this.microbes,"speed");
            html+=this.statlineMinMax(this.microbes,"mutatechance");
            html+=this.statlineMinMax(this.microbes,"mutaterange");
            html+=this.statlineMinMax(this.microbes,"traveledlast");
            html+=this.statlineMinMax(this.microbes,"rotatebreak");
            html+=this.statlineMinMax(this.microbes,"searchradius");
        }
        this.menustats.innerHTML=html;
    }
    statline(key,val){
        return key+": "+val+"<br>";
    }
    statlineMinMax(obj,key,title=null){
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
        if(!title){
            title=key;
        }
        var text=title+": Between "+min+" and "+max+"<br>";
        if(min==max){
            text=title+": "+min+"<br>";
        }
        return text;
    }
    tick(){
        for(var e in this.microbes){
            if(!this.microbes[e].tick()){
                this.stats.deaths+=1;
                this.microbes.splice(e,1);
            }
        }
        for(var e in this.foods){
            if(!this.foods[e].tick()){
                this.foods.splice(e,1);
            }
        }
        if(this.stats.counter % this.foodchance()==0 && this.stats.manualfed>0){
            this.foods.push(new Food(this));
            this.stats.autofed++;
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


        var fps=0;
        var start = new Date().getTime();
        var od=start
        var osec = start
        var atps=this.tps; // actual tps
        var ticks=0;
        var savetimer=start;
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
                target=atps;
            }
            if(work>=1){
                target=target+work
                target=Math.floor(target)
                work-=1;
            }
            for(var i=0;i<target;i++){
                ui.stats.counter++;
                ticks++;
                ui.tick(ui.stats.counter);
                if(i>atps){
                    work+=target-i;
                    console.log("target overflow");
                    break
                }
            }
            od=d;

            if(savetimer+3000<=d){
                savetimer=d;
                ui.save();
            }
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
                ui.drawstats(fps, ticks);
                fps=0;
                ticks=0;
                ui.displayAchievements();
                ui.updateCanvas();
                ui.hidewelcometext();
                ui.showDeathMenu();
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
            if(!ui.stop){
                setTimeout(loop,10);
            }
            //requestAnimationFrame(loop);
        }
        function graphicsloop(){
            var d = new Date().getTime();
            if(osec+1000<=d){
                //ui.updateCanvas();
            }
            ui.draw();
            fps+=1;
            if(!ui.stop){
                requestAnimationFrame(graphicsloop);
            }
        }
    }
    masterrace(){
        var i=new Microbe(this);
        i.speed=1000;
        i.searchradius=1000;
        this.microbes[0]=i;
        return i;
    }
}
