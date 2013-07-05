/*
 * Crontab
 */

var Cron ={

    crontab: {},

    intervalID: 0,

    add: function(minute,   // 0-59
                  hour,     // 0-23
                  daymonth, // 1-31
                  month,    // 1-12
                  dayweek,   // 0-7
                  action
                 ) {

        function __add(cronline, sub_crontab, action, args){
            var z = cronline.shift();
            if (z == undefined) {
                sub_crontab.push({fun: action, args: args});
                return;
            }
            var cr;
            for (var i in cr = z.replace(/[ ]*/g, "").splitenum(',')){
                var limits = cr[i].split("-");
                if (limits.length == 1){
                    if (!sub_crontab[limits[0]])
                        sub_crontab[limits[0]] = (cronline.length? {}: new Array());
                    __add(cronline.concat(), sub_crontab[limits[0]], action, args);
                }
                else
                    for (var j = parseInt(limits[0]); j <= parseInt(limits[1]); j++){
                        if (!sub_crontab[j])
                            sub_crontab[j] = (cronline.length? {}: new Array());
                        __add(cronline.concat(), sub_crontab[j], action, args);
                    }
            } 
        }
        var args = new Array();
        for (var i = 6; i < arguments.length; i++)
            args.push(arguments[i]);
        __add(new Array(minute, hour, daymonth, month, dayweek), this.crontab, action, args);
        
    },

    tick: function() {
        var dt = new Date();
        var dt_array = new Array(
                        dt.getMinutes(),
                        dt.getHours(),
                        dt.getDate(),
                        dt.getMonth(),
                        dt.getDay()
                    );

        function __tick(s_crontab, date){
            var dt = date.shift();
            if (dt == undefined)
                for (var i=0; i < s_crontab.length; i++)
                    s_crontab[i].fun.apply(null, s_crontab[i].args);
            else
                for (var i in s_crontab)
                    if (i == dt || i == "*")
                        __tick(s_crontab[i], date.concat());
        }

        __tick(this.crontab, dt_array);
    },

    start: function() {
        function __adjust(_this){
            _this,intervalID = setInterval(function(_this) {_this.tick();}, 60000, _this);
        }
        var now = new Date();
        var then = new Date();
        then.setMinutes(now.getMinutes()+1);
        then.setSeconds(0);
        then.setMilliseconds(0);
        setTimeout(__adjust, then - now, this);
        jsdump("Cron start: adjusting in " + (then - now) + "ms");
    }
};
