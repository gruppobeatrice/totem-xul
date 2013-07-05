/*
 * simple iCal access library
 * see RFC 2445 for more info
 */



function icalset(props, value){
    props = props.split(';');
    var prop = props[0].toLowerCase();
    if (typeof this[prop] == 'undefined')
        return;
    if (this[prop] instanceof Array)
        this[prop] = value.split(';'); //.push(value);
    if (typeof this[prop] == 'string')
        this[prop] = value;
    if (typeof this[prop] == 'number')
        this[prop] = parseFloat(value);
    if (this[prop] instanceof Date)
        this[prop] = Date(value);
}

function icalsetstatus(status){
    for (var i = 0; i < this.statuses.length; i++){
        if (i == this.statuses[i]){
            this.status = i;
            return;
        }
    }
}

function ICalVEvent() {
};

ICalVEvent.prototype = {
    class: '',
    created: '',
    description: '',
    dtstart: new Date(),
    geo: new Array(),
    lastmod: '',
    location: '',
    organizer: '',
    priority: 0,
    dtstamp: '',
    seq: '',
    status: '',
    statuses: new Array("TENTATIVE", "CONFIRMED", "CANCELLED"),
    summary: '',
    transp: '',
    uid: '',
    url: '',
    recurid: '',

    dtend: new Date(),    // dtend || duration   (!)
    duration: new Date(), // duration || dtend   (!)

    attach: new Array(),
    attendee: new Array(),
    categories: new Array(),
    comment: new Array(),
    contact: new Array(),
    exdate: new Array(),
    exrule: new Array(),
    rstatus: new Array(),
    related: new Array(),
    resources: new Array(),
    rdate: new Array(),
    rrule: new Array(),
    xprop: new Array(),

    set: icalset,

    setstatus: icalsetstatus

}

function ICalVJournal(){
};

ICalVJournal.prototype = {
    class: '',
    created: '',
    description: '',
    dtstart: new Date(),
    dtstamp: '',
    lastmod: '',
    organizer: '',
    recurid: '',
    seq: '',
    status: '',
    statuses: new Array("DRAFT", "FINAL", "CANCELLED"),
    summary: '',
    uid: '',
    url: '',

    attach: new Array(),
    attendee: new Array(),
    categories: new Array(),
    comment: new Array(),
    contact: new Array(),
    exdate: new Array(),
    exrule: new Array(),
    related: new Array(),
    rdate: new Array(),
    rrule: new Array(),
    rstatus: new Array(),
    xprop: new Array(),

    set: icalset,

    setstatus: icalsetstatus
}

function ICalVTimezone() {
};

ICalVTimezone.prototype = {
    tzid: '',
    lastmod: '',
    tzurl: '',

    standardc: new Array(),
    daylightc: new Array(),

    xprop: new Array(),

    set: icalset
}


function ICal() {
    this.source = null;
    this.version = '';
    this.prodid = '';
    this.events = new Array();
}

ICal.prototype = {

    __parseobj: function (obj){
        var vobj = null;
        if (obj[0].toUpperCase().indexOf('VEVENT') > 0)
            vobj = new ICalVEvent();
        if (obj[0].toUpperCase().indexOf('VJOURNAL') > 0)
            vobj = new ICalVJournal();

        if (!vobj) return;
        for (var i = 1; i < obj.length - 1; i++){
            if (obj[i].toUpperCase().indexOf('BEGIN') != 0)
                vobj.set(obj[i]
                            .substr(0, obj[i].indexOf(':') )
                            .replace(/-/g, ''),
                         obj[i].substr(obj[i].indexOf(':') + 1));
            else {
                // TODO: gestire VEVENT
            }
        }
        this.events.push(vobj);
    },


    feed: function(file){

        var data = {};
        var incalendar = false;
        var eof;
        do {
            eof = file.readline(data);
            if (eof){
                var str = String(data.value);
                if (!str.toUpperCase().indexOf('BEGIN:VCALENDAR'))  // false equivale a 0
                    incalendar = true;
                else if (!str.toUpperCase().indexOf('END:VCALENDAR'))
                    incalendar = false;
                else if(incalendar){
                    if (!str.toUpperCase().indexOf('PRODID')){
                        str.replace(/^PRODID\:/, '')
                        this.prodid = str;
                    }
                    if (!str.toUpperCase().indexOf('VERSION')){
                        str.replace(/^VERSION\:/, '')
                        this.version = str;
                    }
                    if (!str.toUpperCase().indexOf('BEGIN:')){
                        var obj = new Array(str.valueOf());
                        var objType = str.substr(str.indexOf(':') + 1);
                        do {
                            if (file.readline(data)){
                                var strobj = String(data.value);
                                obj.push(strobj);
                                if (!strobj.toUpperCase().indexOf('END:' + objType))
                                    break;
                            }
                            else break;
                        } while(eof);
                        this.__parseobj(obj);
                    }
                } 
            }
        } while (eof);
        jsdump("Function ICal.feed: " + this.events.length + " events loaded");

    },

    gettodayevents: function(){
        this.events.filter(function(el, idx, array){
                var dt = new Date();
                return (el.dtstart <= dt && dt <= el.dtend);
            } );
    }
}


function ICalIterator(ical) {
    this.head = -1;
    this.events = ical.gettodayevents();
}

ICalIterator.prototype = {
    next: function() {
        var ev = this.events.shift();
        this.events.push(ev);
        return ev;
    }
}
