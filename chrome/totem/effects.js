
var FX_FADE = 'fade';
var FX_CURTAIN = 'curtain';

var FXV_CURTAIN_OPEN = 1;
var FXV_CURTAIN_CLOSE = 0;
function  Effects () {

    this.Lock = Array();
    this.Active = Array();

    this.isWorking = function (effect){
        return this.Active.indexOf(effect) > -1;
    }

    // Varia gradualmente l'opacita' dell'elemento
    this.fade = function (objstr, open, end, nextEvt){
        if (this.Lock.indexOf(objstr) > -1){
            setTimeout(function(thisObj, _objstr, _open, _end, _nextEvt){thisObj.fade(_objstr, _open, _end, _nextEvt)},
                       15, this, objstr, open, end, nextEvt);
            return;
        }
        this.Active.push(FX_FADE);
        this.__fade(objstr, open, end, nextEvt);
    }


    this.__fade = function (objstr, open, end, nextEvt){
        var lock = this.Lock.indexOf(objstr);
        if (lock == -1)
            this.Lock.push(objstr);
        var obj = document.getElementById(objstr);
        if (!obj.style.opacity)
            obj.style.opacity = 1.0;
        if (open >= end && end >= 0 && obj.style.opacity > end){
            obj.style.opacity = parseFloat(obj.style.opacity) - 0.1;
            setTimeout(function(thisObj, _objstr, _open, _end, _nextEvt){thisObj.__fade(_objstr, _open, _end, _nextEvt)},
                       15 , this, objstr, open - 0.1, end, nextEvt);
        }
        else if (open < end && open >= 0 && obj.style.opacity < end){
            obj.style.opacity = parseFloat(obj.style.opacity) + 0.1;
            setTimeout(function(thisObj, _objstr, _open, _end, _nextEvt){thisObj.__fade(_objstr, _open, _end, _nextEvt)},
                       15 , this, objstr, open + 0.1, end, nextEvt);
        }
        else {
            if (nextEvt)
                nextEvt();
            this.Active.splice(this.Active.indexOf(FX_FADE),1);
            this.Lock.splice(lock, 1);
        }
    };


    // Apre/chiude un elemento con effetto persiana
    this.curtain = function (objstr, action, nextEvt){
        if (this.Lock.indexOf(objstr) > -1){
            setTimeout(function(thisObj, _objstr, _action, _nextEvt){thisObj.curtain(_objstr, action, _nextEvt)},
                       15, this, objstr, action, nextEvt);
            return;
        }
        this.Active.push(FX_CURTAIN);
        this.__curtain(objstr, action, nextEvt);
    }

    this.__curtain = function (objstr, action, nextEvt){
        var lock = this.Lock.indexOf(objstr);
        if (lock == -1)
            this.Lock.push(objstr);
        var obj = document.getElementById(objstr);
        var objstyle = document.defaultView.getComputedStyle(obj, '');
        var height = (objstyle.height).replace(/[a-zA-Z]/g, '');
        var maxHeight = (objstyle.maxHeight != 'none' ?objstyle.maxHeight:objstyle.height).replace(/[a-zA-Z]/g, '');
        var prevHeight = (arguments[3]?arguments[3]:1);


        if (action == FXV_CURTAIN_OPEN
            && parseInt(height) != parseInt(prevHeight)){
            obj.style.overflow = 'hidden';
            //obj.style.maxHeight = '';
            //jsdump(objstyle.overflow);
            jsdump('-'  + prevHeight + "-"+ height)
            obj.style.maxHeight = parseInt(maxHeight) + 5 + 'px';
            setTimeout(function(thisObj, _objstr, _action, _nextEvt, _prevHeight){thisObj.__curtain(_objstr, _action, _nextEvt, _prevHeight)}, 15, this, objstr, action, nextEvt, height);
        }
        else if (action == FXV_CURTAIN_CLOSE
                 && parseInt(maxHeight) > 0){
            obj.style.overflow = 'hidden';
            if (maxHeight >= 5)
                obj.style.maxHeight = parseInt(maxHeight) - 5 + 'px';
            else
                obj.style.maxHeight = '0px';
            setTimeout(function(thisObj, _objstr, _action, _nextEvt){thisObj.__curtain(_objstr, _action, _nextEvt)}, 15, this, objstr, action, nextEvt);
        }
        else {
            if (FXV_CURTAIN_OPEN)
                obj.style.overflow = 'auto';
            else if(FXV_CURTAIN_CLOSE && parseInt(maxHeight) == 0);
                obj.style.overflow='hidden';
            if (nextEvt)
                nextEvt();
            this.Active.splice(this.Active.indexOf(FX_CURTAIN),1);
            //jsdump('-'  + scrollHeight + "-"+ height)
            this.Lock.splice(lock, 1);
        }
   
    }
}
