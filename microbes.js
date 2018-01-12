"use strict";
class Microbes{
    constructor(id){
        this.id=id;
        this.ui=new Ui(id,this);
        this.playing=false;
    }
    play(){
        this.ui.stop=false;
        if(!this.playing){
            this.ui.play();
        }
        this.playing=true;
    }
    stop(){
        this.ui.stop=true;
        this.playing=false;

    }
    reset(){
        this.stop();
        this.ui=new Ui(this.id,this,true);
        this.play();
    }

}
