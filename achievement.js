class Achievement{
    constructor(name, blurb, code) {
        this.name=name;
        this.blurb=blurb;
        this.code=code;
        this.done=false;
    }
    check(){
        if(this.done){
            return false;
        }

        var result=this.code();

        if(result){
            this.done=true;
            this.addToQ()
        }
        return result;
    }
    addToQ(){
        achievementQ.push(this);
    }
}
