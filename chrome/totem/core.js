/**
 * Core functions
 *
 */

var dateTimeIntervalID;

var rssTimeIntervalID;
var rssSources = Array();
var rdfTimeIntervalID;
var rdfIterator;
var runtime = new Date();

function __reload(rss){
   for (var i=0; i<rss.length; i++){
        var r = rss.shift();
        r.source.reload();
        rss.push(r);
    }
}

function reload(){
    __reload(rssSources);
}

function doInit(){

    Cron.start();

    // impostazione orologio
    var dt = new DateTime("datetime");
    dt.start();
    //dateTimeIntervalID = setInterval(dt.switchDateTime, 5000);

    //Creazione Datasource calendario
    var rdf = new RDFData();
    //var gap = new LocalFile(Config.getPrefs("schedule"));
    var gaptxt = Config.getPrefs("schedule");
    var gap = null;
    if (gaptxt.match(/^http/))
        gap = new NetworkFile(gaptxt);
    else
        gap = new LocalFile(gaptxt);
    if (rdf.generate(gap, new LocalFileParser(gap))){
        switchCourses(rdf);
        //rdfTimeIntervalID = setInterval(switchCourses, 1800000, rdf);
        Cron.add("0,45", "8-19", "*", "*", "*", switchCourses, rdf);
    }
    switchEvents(new RSSData(Config.getPrefs("event.1")));

    //caricamento feed rss
    var i = 1;
    while (Config.getPrefs("url." + i) != null){
        var url = Config.getPrefs("url." + i);
        rssSources.push(
            {url: url, source: new RSSData(url)});
        i++;
    }
    //var ics = new LocalFile('/home/leonardo/Desktop/Home.ics');
    //new ICal().feed(ics);

    //impostazione ticker
    //rssTimeIntervalID = setInterval(switchNewsTicker, 15000, rssSources);
    Cron.add("*", "*", "*", "*", "*", switchNewsTicker, rssSources);
    Cron.add("*", "*", "*", "*", "*", switchNewsTicker, rssSources);
    Cron.add("45-59,1-31", "8-19", "*", "*", "*", showStack, "stackschedule");
    Cron.add("0,5,10,15,20,25,30", "8-19", "*", "*", "*", showStack, "stackevent");
    Cron.add("30", "*", "*", "*", "*", __reload, rssSources);
    showStack("stackschedule");
    showStack("stackevent");
}
