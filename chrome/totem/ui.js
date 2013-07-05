/*
 * Modifica della UI 
 */


function switchCourses (rdfsource){
    var elm = new Array();
    var rdfIterator = rdfsource.iterator();

    // Creazione elementi orario
    while (rdfIterator.hasmoreelements()){
        var i = rdfIterator.next();
        var vbox = document.createElement("vbox");
        var lblTitle = document.createElement("label");
        var lblCourse = document.createElement("label");
        var lblPeople = document.createElement("label");
        lblTitle.className = "courseTitle";
        lblCourse.className = "courseCourse";
        lblPeople.className = "coursePeople";
        lblTitle.textContent = i.course.Value.capitalize();
        lblCourse.textContent = "Ore " + i.start.getHours() + " - " +
                          i.stop.getHours() + ", aula " +
                          i.hall.Value.toUpperCase();
        lblPeople.textContent = "Docente: " + i.people.Value.capitalize();
        vbox.appendChild(lblTitle);
        vbox.appendChild(lblCourse);
        vbox.appendChild(lblPeople);
        elm.push(vbox);
    }

    if (elm.length <= 0)
        return;

    // append
    var columns = Config.getPrefs("schedule.columns");
    var colArray = new Array();
    var schedule = document.getElementById("schedule");
    var scheduleinlay = document.createElement("hbox");
    scheduleinlay.id = "scheduleinlay";
    schedule.removeChild(schedule.firstChild);
    schedule.appendChild(scheduleinlay);

    for (var i = 0; i < columns; i++){
        colArray.push(document.createElement("vbox"));
        colArray[i].setAttribute("flex", "1");
        scheduleinlay.appendChild(colArray[i]);
    }
    for (var i = 0; i < elm.length; i++){
        elm[i].className = (i % 2 ? "course left": "course");
        colArray[i % columns].appendChild(elm[i]);
    }

    var __scroll = function(func, elm, scrollbox, interval){
            scrollbox
                .boxObject
                .QueryInterface(Components.interfaces.nsIScrollBoxObject)
                //.scrollToElement(elm);
                .ensureElementIsVisible(elm);
            if (elm.nextSibling != null)
                setTimeout(func, interval, func, elm.nextSibling, scrollbox, interval);
            else
                setTimeout(func, 8000, func, elm.parentNode.firstChild, scrollbox, interval);
        };
    setTimeout(__scroll, 8000, __scroll, elm[0], schedule, 2000*columns);
}


function switchEvents(rss){
    var title = document.getElementById("eventtitle");
    var summary = document.getElementById("eventsummary");
    var description = document.getElementById("eventdescription");

    if (rss.feeds.length) {
        title.textContent = rss.feeds[0].title;
        if (rss.feeds[0].longdescription){
            summary.textContent = rss.feeds[0].description;
            description.textContent = rss.feeds[0].longdescription;
        }
        else
            description = rss.feeds[0].description; 
    }
    else {
        title.textContent = "Spazio libero per affissioni";
        summary.textContent = "Hai un evento da proporre e vuoi " +
                              "pubblicizzarlo? ";
        description.textContent = "Contatta  \"" + Config.getPrefs("admin") +
                                  "\", oppure scrivi all'indirizzo email " +
                                  Config.getPrefs("admin.mail") + 
                                  ". Il tuo annuncio verra mostrato a " + 
                                  "rotazione su questo schermo durante le " +
                                  "ore della giornata.";
    }

    var scr_width = screen.width; // .availWidth
    var scr_height = screen.height / 1.5 ; 
    var eventbox = document.getElementById("event");
    eventbox.width = scr_width / 10 * 8;
    eventbox.height = scr_height / 10 * 8 ;
    eventbox.style.left = scr_width / 10 + "px";
    eventbox.style.top = scr_height / 10 + "px";

}



var rssRoundRobin = 0;
var scrollTextIntervalId = null;
var scrollTitleIntervalId = null;
var completeScrollText = true;
var completeScrollTitle = true;
var rollingNews = new Array();
function switchNewsTicker(rssSources){
    // selezione di un feed rss
    var rss = rssSources[rssRoundRobin].source;
    if (!rss.feeds || Scroll.rollingobjects() > 50) return; //!completeScrollText || !completeScrollTitle) return; 

    if (rss.feeds.length > 0){
        //var fx = new Effects();
        function next(){
            // acquisizione delle label
            var rssTextScroll = document.getElementById('rsstextscroll');
            var rssTitleScroll = document.getElementById('rsstitlescroll');

            // visualizzazione dei valori delle label
            var scroll_w = parseInt(getComputedStyle(rssTitleScroll, '').width);
            var newtitle_w = 0;
            var newtext_w = 0;
            var numbox = 0;
            var generableText = true;
            var generableTitle = true;
            do{
                var titleLabel;
                var textLabel;

                // cloneNode e' piu' veloce di createElement
                if (newtitle_w < Math.max(scroll_w, (newtitle_w + newtext_w) / 2 )) {
                    if (rssTitleScroll.firstChild != null)
                        titleLabel = rssTitleScroll.firstChild.cloneNode(true);
                    else {
                        titleLabel = document.createElement("label");
                    }
                    if (!newtitle_w){
                        titleLabel.textContent = rss.feeds[0].pubdate.toLocaleDateString() + " " + rss.feeds[0].pubdate.toLocaleTimeString();
                        titleLabel.className = "rsstitle first";
                    }
                    else{
                        titleLabel.textContent = rss.feeds[0].title.normalize().capitalize();
                        titleLabel.className = "rsstitle";
                    }

                    rssTitleScroll.appendChild(titleLabel);
                    newtitle_w += titleLabel.boxObject.width; 
                    numbox++;
                }
                else generableTitle = false;
                if (newtext_w < Math.max(scroll_w, (newtitle_w + newtext_w)/2)){
                    if (rssTextScroll.firstChild != null)
                        textLabel = rssTextScroll.firstChild.cloneNode(true);
                    else {
                        textLabel = document.createElement("description");
                        textLabel.className = "rsstext";
                    }
                    textLabel.textContent = rss.feeds[0].description.normalize().capitalize();
                    if (!newtext_w)
                        textLabel.className = "rsstext first";
                    else
                        textLabel.className = "rsstext";
                    rssTextScroll.appendChild(textLabel);
                    newtext_w += textLabel.boxObject.width;
                    numbox++;
                }
                else generableText = false;
                
            } while(Math.min(newtext_w, newtitle_w) <= Math.min(scroll_w * 2, (newtitle_w + newtext_w)/2 ) && (generableText || generableTitle));
                

            //rssDate.value = rss.feeds[0].pubdate.toLocaleDateString();

            var scrolltext = rssTextScroll.boxObject
                .QueryInterface(Components.interfaces.nsIScrollBoxObject);
            var scrolltitle = rssTitleScroll.boxObject
                .QueryInterface(Components.interfaces.nsIScrollBoxObject);

            // velocita' di testo e titolo devono essere
            // aggiustate di modo che lo scrolling termini
            // approssimativamente allo stesso istante.
            var speed = Math.round(Math.min(newtext_w, newtitle_w) * 10 /Math.max(newtext_w, newtitle_w) );
            //return;
            if (newtext_w > newtitle_w) 
                Scroll.push(numbox, 10, speed, rssTextScroll, rssTitleScroll, scrolltext, scrolltitle, newtext_w, newtitle_w);
            else  
                Scroll.push(numbox, speed, 10, rssTextScroll, rssTitleScroll, scrolltext, scrolltitle, newtext_w, newtitle_w);
            

        } 

        //fx.curtain('newsticker', FXV_CURTAIN_CLOSE, next);
        //fx.curtain('newsticker', FXV_CURTAIN_OPEN, null);
        Scroll.start();
        next();

        // ruota le news
        rss.feeds.push(rss.feeds.shift());
    }

    // cicla per selezionare il prossimo feed
    rssRoundRobin = (rssRoundRobin + 1) % rssSources.length;
}

var Scroll = {

    rollingNews: new Array(),

    push: function(numbox, speed1, speed2, obj1, obj2, scroll1, scroll2, width1, width2){

        this.rollingNews.push({
            numbox: numbox,
            speed: new Array(speed1, speed2),
            obj: new Array(obj1, obj2),
            scroll: new Array(scroll1, scroll2),
            width: new Array(width1, width2)
        });
    },

    isscrolling: false,

    scrollID: null,

    start: function(){
        if (this.isscrolling)
            return;
        this.isscrolling = true;
        this.scrollID = setTimeout(this.__scroll, 100, this);
    },

    stop: function(){
        if(!this.isscrolling)
            return;
        clearTimeout(this.scrollID);
        this.isscrolling = false;
    },

    __scroll: function(thisObj){
        if (!thisObj.isscrolling)
            return;

        for (var i = 0; i < thisObj.rollingNews[0].speed.length; i++){
            
            var scroll = thisObj.rollingNews[0].scroll[i];
            var speed = thisObj.rollingNews[0].speed[i];
            var obj = thisObj.rollingNews[0].obj[i];

            scroll.scrollBy(speed,0);
            if (obj.firstChild.boxObject.screenX < 0 - obj.firstChild.boxObject.width){
                thisObj.rollingNews[0].width[i] -= obj.firstChild.boxObject.width;
                obj.removeChild(obj.firstChild);
                scroll.scrollToElement(obj.firstChild);//.ensureElementIsVisible(obj.firstChild);
                if (--thisObj.rollingNews[0].numbox == 0)
                    thisObj.rollingNews.shift();
                else{
                    if (thisObj.rollingNews[0].width[i] <= 0){
                        thisObj.rollingNews[0].speed[1 - i]++;
                        if (thisObj.rollingNews[0].speed[i])
                            thisObj.rollingNews[0].speed[i]--;
                    }
                    if (thisObj.rollingNews[0].width[1 - i] <= 0){
                        thisObj.rollingNews[0].speed[i]++;
                        if (thisObj.rollingNews[0].speed[1 - i])
                            thisObj.rollingNews[0].speed[1 - i]--;
                    }
                }
            }
        }

        thisObj.scrollID = setTimeout(thisObj.__scroll, 100, thisObj);
    },

    rollingobjects: function() {
        var ret = {value: 0};
        this.rollingNews.forEach(function(elm, idx, array){
               ret.value += elm.numbox;
            },
            ret
        );
        return ret.value;
    }

}
/** 
 * Date Time Functions
 */



function DateTime(element){
    if (typeof element == "string")
        this.datetime = document.getElementById(element);
    else
        this.datetime = element;

    this.timeIntervalID = null;
    this.switchID = null;
    this.isswicthing = false;
    //this.switchDateTime();
}

DateTime.prototype = {

    updateTime: function(thisObj) {
        thisObj.datetime.value = (new Date()).toLocaleTimeString();
    },

    updateDay: function() {
        this.datetime.value = (new Date()).toLocaleDateString();
    },

    start: function(){
        if (this.isswitching)
            return;
        this.isswitching = true;
        this.switchID = setTimeout(this.__switch, 5000, this);
    },

    stop: function(){
        if(!this.isswitching)
            return;
        clearTimeout(this.switchID);
        this.isswitching = false;
    },

    __switch: function(thisObj){
        //var fx = new Effects();
        //function next(){
        if ( thisObj.timeIntervalID == null){
            thisObj.timeIntervalID = setInterval(thisObj.updateTime, 1000, thisObj);
        }
        else {
            clearInterval(thisObj.timeIntervalID);
            thisObj.timeIntervalID = null;
            thisObj.updateDay();
        }
        if (thisObj.isswitching)
            thisObj.switchID = setTimeout(thisObj.__switch, 5000, thisObj);
        //};
        //fx.fade("hticker", 1.0, 0.0, next);
        //fx.fade("hticker", 0.0, 1.0, function() {return;});
        //next();
    }
}

function showStack(stackname){
    var stack = document.getElementById(stackname);
    var stackparent = stack.parentNode;
    for (var i=0; i<stackparent.childNodes.length; i++){
        stackparent.childNodes[i].style.opacity = 0.2;
    }
    stackparent.appendChild(stackparent.removeChild(stack));
    stack.style.opacity = 1;
}
