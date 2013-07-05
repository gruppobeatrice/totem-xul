/**
 * Core functions
 *
 */

var dateTimeIntervalID;

var rssTimeIntervalID;
var rssSources = Array() 


function doInit(){
    // impostazione orologio
    dateTimeIntervalID = setInterval(switchDateTime, 5000);

    //Creazione Datasource calendario
    RDFData.populate();

    //caricamento feed rss
    /*var i = 1;
    while (Config.getPrefs("url." + i) != null){
        var url = Config.getPrefs("url." + i);
        rssSources.push(
            {url: url, source: new RSSData(url, null)});
        i++;
    }*/

    //impostazione ticker
    rssTimeIntervalID = setInterval(switchNewsTicker, 15000, rssSources);

}

