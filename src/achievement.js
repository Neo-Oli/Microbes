export default class Achievement{
    constructor(ui,icon,name, blurb, code) {
        this.ui=ui;
        this.name=name;
        this.blurb=blurb;
        this.code=code;
        this.icon=icon;
        this.name="Achievement";
        this.done=false;
    }
    check(){
        if(this.done){
            return false;
        }

        var result=this.code();

        if(result){
            this.done=true;
            this.addToQ();
        }
        return result;
    }
    addToQ(){
       this.ui.achievementQ.push(this);
    }
    save(){
        var obj=this;
        delete obj.ui;
        return obj;
    }
}
