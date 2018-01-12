"use strict";
class Microbes{
    constructor(id){
        this.id=id;
        this.ui=new Ui(id,this);
    }
    play(){
        this.ui.stop=false;
        this.ui.play();
    }
    stop(){
        this.ui.stop=true;

    }
    reset(){
        this.stop();
        this.ui=new Ui(this.id,this,true);
        this.play();
    }

}
