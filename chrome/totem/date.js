/** 
 * Date Time Functions
 */


var timeIntervalID = null;

function updateTime(){
    var datetime = document.getElementById("datetime");
    var dt = new Date();
    datetime.value = dt.toLocaleTimeString();
}

function updateDay(){
    var datetime = document.getElementById("datetime");
    var dt = new Date();
    datetime.value = dt.toLocaleDateString();
}

function switchDateTime(){
    var fx = new Effects();
    function next(){
        if ( timeIntervalID == null){
            updateTime();
            timeIntervalID = setInterval(updateTime, 1000);
        }
        else {
            clearInterval(timeIntervalID);
            timeIntervalID = null;
            updateDay();
        }
    };
    //fx.fade("hticker", 1.0, 0.0, next);
    //fx.fade("hticker", 0.0, 1.0, function() {return;});
    next();
}
