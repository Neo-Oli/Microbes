var debug=false;
var numMicrobes=4;
var foodmod=0
var feedvol=10;
var feedspread=10;
var tps=100;
var maxspeed=false;
var minfps=60
var debugvar=null;
var speedmod=50;
var colors=[[255,0,0],[0,255,0],[0,0,255],[255,255,0]];
var canvas;
var ctx;
var microbes;
var foods;
var counter;
var ticks;
var stats;
var deaths=0;
var colorspeedup=50
var mincolor=100;
var maxcolor=255;
var frameskip=1;
var width=0;
var height=0;
var container;
var achievements=new Array();
var achievementQ=new Array();
var achievementElement;
var achievementElementName;
var achievementElementBlurb;
var achievementDisplaytime=0;
var menuAchievementsElement;
window.onload = function () { setup("microbes1"); }
function setup(id){
    container=document.getElementById(id);
    var html="";
        html+='<div class="menutrigger">⚙</div>';
        html+='<div class="menu">';
        //html+='<label>less food</label><label>more food</label><input type="range" min="-200" max="200" class="slider reversed" id="foodmodslider" data-variable="foodmod"><div class="reset" data-target="foodmodslider">⟲</div>';
        //html+='<label>slower</label><label>faster</label><input type="range" min="10" max="5000" class="slider" id="tpsslider" data-variable="tps"><div class="reset" data-target="tpsslider">⟲</div>';
        html+='<div class="achievements"></div>';
        html+='<div class="stats"></div>';
        html+='</div>';
        html+='<canvas id="microbes" width="200" height="100">';
        html+='Your browser does not support the canvas element.';
        html+='</canvas>';
        html+='<div id="achievement">';
        html+='<div class="title">Achievement</div>';
        html+='<div class="name">null</div>';
        html+='<div class="blurb">null</div>';
        html+='</div>';

    container.innerHTML=html;
    var inputs=container.querySelectorAll("input");

    for(i=0;i<inputs.length;i++){
        element=inputs[i];
        element.value=window[element.getAttribute('data-variable')];
        element.setAttribute("data-default",element.value);
        element.addEventListener("change",function(e){
            element=e.originalTarget;
            variable=element.getAttribute('data-variable');
            window[variable]=parseInt(element.value);
        });
    }

    var resets=container.querySelectorAll(".reset");
    for(i=0;i<resets.length;i++){
        element=resets[i];
        element.addEventListener("click",function(e){
            element=e.originalTarget;
            target=element.getAttribute('data-target');
            target=container.querySelector("#"+target);
            defaultvalue=parseInt(target.getAttribute("data-default"));
            target.value=defaultvalue;
            variable=target.getAttribute('data-variable');
            window[variable]=defaultvalue;
        });
    }

    container.classList.add("microbescontainer");
    canvas = container.querySelector("canvas");
    stats = container.querySelector(".stats");
    menutrigger = container.querySelector(".menutrigger");
    ctx = canvas.getContext("2d");
    microbes=[];
    foods=[];
    counter=0;
    ticks=0;
    canvas.addEventListener("mousedown",feed);
    menutrigger.addEventListener("click",function(e){
        container.classList.toggle("menushown");
    });
    setupAchievements();
    main();
}

function setupAchievements(){
    achievementElement=container.querySelector("#achievement");
    achievementElementName=achievementElement.querySelector(".name");
    achievementElementBlurb=achievementElement.querySelector(".blurb");
    menuAchievementsElement=container.querySelector(".achievements");
    achievements.push("Numbers");
    achievements.push(new Achievement("100 microbes", "Is it getting crowded in here?" ,function(){return microbes.length>=100}));
    achievements.push(new Achievement("10 microbes", "First 10 microbes" ,function(){return microbes.length>=10}));
    achievements.push(new Achievement("51 microbes", "First 51 microbes" ,function(){return microbes.length>=51}));
    achievements.push(new Achievement("52 microbes", "First 52 microbes" ,function(){return microbes.length>=52}));
    achievements.push(new Achievement("53 microbes", "First 53 microbes" ,function(){return microbes.length>=53}));
    achievements.push(new Achievement("54 microbes", "First 54 microbes" ,function(){return microbes.length>=54}));
    achievements.push(new Achievement("55 microbes", "First 55 microbes" ,function(){return microbes.length>=55}));
    checkAchievements();
    displayAchievements();
    menuAchievements();
}
function checkAchievements(){
    for(i=0;i<achievements.length;i++){
        if(achievements[i].constructor.name=="Achievement"){
            var result=achievements[i].check();
        }
    }
}
function displayAchievements(){
    if(achievementDisplaytime>0){
        achievementDisplaytime--;
        if(achievementDisplaytime<1){
            achievementElement.classList.remove("visible");
        }
        return false;
    }

    a=achievementQ[0];
    if(a){
        achievementElementName.innerHTML=a.name;
        achievementElementBlurb.innerHTML=a.blurb;
        achievementElement.classList.add("visible");
        achievementDisplaytime=5;
        achievementQ.shift();
        menuAchievements();
    }
}
function menuAchievements(){
    var allhtml="";
    for(i=0;i<achievements.length;i++){
        a=achievements[i];
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
    menuAchievementsElement.innerHTML=allhtml;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}
function sortFunction(a, b) {
    if (a[0] === b[0]) {
        return 0;
    }
    else {
        return (a[0] < b[0]) ? -1 : 1;
    }
}
function random(max,min=0,pow=1){
    return Math.round(Math.pow(Math.random(),pow) * (max - min) + min);
}

function feed(event){
    for(i=0;i<feedvol;i++){
        food=new Food();
        p=food.randompos(event.pageX,event.pageY, feedspread);
        food.x=p[0];
        food.y=p[1];
        foods.push(food);
    }
}
function draw(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(e in foods){
        foods[e].draw();
    }
    for(e in microbes){
        microbes[e].draw();
    }


}
function updateCanvas(){
    var newWidth=canvas.offsetWidth;
    var newHeight=canvas.offsetHeight
    if(width!=newWidth || height!=newHeight){
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        width=newWidth;
        height=newHeight;
    }
}
function drawstats(fps, counter,ticks,maxspeedstats){
    html="";
    html+=statline("fps",fps);
    html+=statline("ticks",counter);
    html+=statline("ticks/s",ticks);
    html+=statline("foods",foods.length);
    html+=statline("Food Chance",foodchance());
    html+=maxspeedstats;
    if(debugvar!==null){
        html+=statline("debugvar",debugvar);
    }
    html+=statline("alive",microbes.length);
    html+=statline("deaths",deaths);
    html+=statline("total",deaths+microbes.length);
    html+=statlineMinMax(microbes,"generation");
    html+=statlineMinMax(microbes,"mutations");
    html+=statlineMinMax(microbes,"fullhealth");
    html+=statlineMinMax(microbes,"size");
    html+=statlineMinMax(microbes,"minsize");
    html+=statlineMinMax(microbes,"maxsize");
    html+=statlineMinMax(microbes,"speed");
    html+=statlineMinMax(microbes,"mutatechance");
    html+=statlineMinMax(microbes,"mutaterange");
    html+=statlineMinMax(microbes,"traveledlast");
    html+=statlineMinMax(microbes,"rotatebreak");
    html+=statlineMinMax(microbes,"searchradius");
    stats.innerHTML=html;
}
function statline(key,val){
    return key+": "+val+"<br>";
}
function statlineMinMax(obj,key){
    var min=0;
    var max=0;
    var sorted=obj.sort(function(a, b){
        av=a[key];
        bv=b[key];
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
function tick(counter){
    for(e in microbes){
        if(!microbes[e].tick()){
            deaths+=1;
            microbes.splice(e,1);
        }
    }
    for(e in foods){
        if(!foods[e].tick()){
            foods.splice(e,1);
        }
    }
    if(counter % foodchance()==0){
        //foods.push(new Food());
    }
}
function foodchance(){
    res=microbes.length/2;
    res+=foodmod;
    if(res<1){res=1;}
    return Math.floor(res);
}
function action(){
    ticks++;
    counter++;
    tick(counter);
}
function main(){
    //var con={};
    //con.canvas=canvas;
    //con.ctx=ctx;
    //con.microbes=microbes;
    updateCanvas();
    draw();
    for(i=0;i<numMicrobes;i++){
        microbes.push(new Microbe());
    }
    microbes[0].x=width/2;
    microbes[0].y=height/2;
    var fps=0;
    var start = new Date().getTime();
    var od=start
    var osec = start
    var ofps=0;
    var oticks=0;
    var done=0;
    var atps=tps; // actual tps
    var speedstep=1;
    var speedvelocity=1;
    var fpsstats=[]
    var fpsfuzzy=10
    var target=1;
    var missed=0;
    var time=0
    var safespeed=tps;
    var emergencystops=0;
    var loopcounter=0;
    for(i=0;i<fpsfuzzy;i++){
        fpsstats.push(60);
    }

    loop();
    function loop(){
        loopcounter+=1;
        atps=tps
        var d = new Date().getTime();
        target=(d-(start+time))*(atps/1000);
        var work=(target-done)
        work=Math.ceil(work);
        for(i=0;i<work;i++){
            action();
        }
        done += work;
        if(osec+1000<=d){
            time+=1000
            missed=atps-ticks;
            while(ticks<atps){
                action();
            }
            osec=d;
            ofps=fps
            //fpsstats.push(fps);
            //fpsstats.shift();
            //ofps=Math.round(fpsstats.reduce(function(a,b){return a+b})/fpsfuzzy);
            //if(ofps>=minfps-5){
            //safespeed=atps;
            //}
            fps=0;
            oticks=ticks;
            ticks=0;

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
            //maxspeedstat+=statline("tps",atps);
            //maxspeedstat+=statline("speedstep",speedstep);
            //maxspeedstat+=statline("safespeed",safespeed);
            //maxspeedstat+=statline("Target FPS",minfps);
            //maxspeedstat+=statline("emergency stops",emergencystops);
            //}else{
            maxspeedstat=""
            //atps=tps;
            //}
            drawstats(ofps, counter, oticks,maxspeedstat);
            displayAchievements();
            updateCanvas();
        }
        if(loopcounter % frameskip==0){
            draw();
            fps+=1;
        }
        requestAnimationFrame(loop);
    }
}
function masterrace(){
    i=new Microbe;
    i.speed=1000;
    i.searchradius=1000;
    microbes[0]=i;
    return i;
}
