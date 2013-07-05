/*
 * Datasource interfaces
 */

function RSSData(source, onLoadFunction){

    // Init permette di ricaricare in modo asincrono il feed ogni ora
    this.Init = function(thisObj){
        thisObj.feeds = new Array();

        // richieste documenti asincrone
        thisObj.req = new XMLHttpRequest();
        thisObj.req.open('GET', source, false);
        thisObj.req.overrideMimeType('text/xml');
        thisObj.req.send(null);

        // listener per gli eventi del feed
        thisObj.handleResult = function (result){
            var feedTemp = new Array();
            var feed = result.doc.QueryInterface(Components.interfaces.nsIFeed);
            if (!feed.items.length)
                return;
            for (var i=0; i<feed.items.length; i++){
                var feeditem = feed.items.queryElementAt(i,
                    Components.interfaces.nsIFeedEntry);

                feedTemp.push({title: feeditem.title.text,
                      pubdate: new Date(feeditem.updated),
                      description: (feeditem.summary?feeditem.summary.text:feeditem.content.text)
                      });
            }

            // ordinamento array
            feedTemp.sort( function(a,b){
                var aTime = a.pubdate;
                var bTime = b.pubdate;
                if ( aTime > bTime) return -1;
                if ( aTime == bTime) return 0;
                if ( aTime < bTime ) return 1;
                return 0;
             }
            );

            // la news piu' recente viene sempre visualizzata
            var comparedate = feedTemp[0].pubdate;
            thisObj.feeds.push(feedTemp.shift());
            thisObj.feeds = thisObj.feeds.concat(feedTemp.filter(function(element, index, array){
                return comparedate - element.pubdate <= 604800000; // 7 giorni
            }, thisObj));
        }

        // Creazione oggetti feed
        if (thisObj.req.status == 200){
            thisObj.req.xml =  thisObj.req.responseText;  
            var feedparser = Components.classes["@mozilla.org/feed-processor;1"]
                .createInstance(Components.interfaces.nsIFeedProcessor);
            feedparser.listener = thisObj;
            feedparser.parseFromString(thisObj.req.xml,
                                       Components.classes["@mozilla.org/network/io-service;1"]
                                       .getService(Components.interfaces.nsIIOService)
                                       .newURI("file:///" + source.replace(/[^\w]/g,''), null, null));
        }

    }
    setTimeout(this.Init, 1000, this);
    setInterval(this.Init, 3600000);

}



var RDFData = {
    

    //apertura del file
    open: function (fileName){
        var file = Components.classes["@mozilla.org/file/local;1"]
            .createInstance(Components.interfaces.nsILocalFile);
        file.initWithPath(fileName);
        if (!file.exists())
            return null;

        var inputStream = Components.classes["@mozilla.org/network/file-input-stream;1"]
            .createInstance(Components.interfaces.nsIFileInputStream);
        //apertura file in modalita' readonly
        inputStream.init(file, -1, -1, 0);
        return inputStream.QueryInterface(Components.interfaces.nsILineInputStream);
    },

    cube: new Object(),

    populate: function ()
    {
        var stream = this.open(Config.getPrefs("schedule"));
        if (stream)
	{
            var eof ;
            var data = {};

            // campi del file current.gap:
            // giorno, sigla, aula, ora_inizio, ora_fine, docente, anno_corso, laurea, codice_corso = i.split(";") 
            do
	    {
                eof = stream.readLine(data);
                var line = String(data.value);
                //lines.push(line);
                var fields = line.split(' ; ');

		var giorno = fields[0];
		var sigla  = fields[1];
		var aula   = fields[2];
		var inizio = fields[3];
		var fine   = fields[4];

                var treechildren = document.createElement("treechildren");
                var treeitem     = document.createElement("treeitem");
                var treerow      = document.createElement("treerow");
                var treecell     = document.createElement("treecell");

                treechildren.appendChild(treeitem);
                treeitem.appendChild(treerow);

                treecell.setAttribute("value", sigla);
                treerow.appendChild(treecell);

                treecell = document.createElement("treecell");
                treecell.setAttribute("value", aula);
                treerow.appendChild(treecell);

                treecell = document.createElement("treecell");
                treecell.setAttribute("value", inizio);
                treerow.appendChild(treecell);

                treecell = document.createElement("treecell");
                treecell.setAttribute("value", fine);
                treerow.appendChild(treecell);

                document.getElementById("schedule").appendChild(treechildren);


                if (eof)
		{
                    var start = parseInt(fields[3].substr(0,2)); 
                    var hours = parseInt(fields[4].substr(0,2)) - start;

//                    for(var i = 0; i < hours; i++)
//		    {
                        if (this.cube[giorno] == null)
                            this.cube[giorno] = new Object();

                        if (this.cube[giorno][inizio] == null)
                            this.cube[giorno][inizio] = new Object();

//                        if (this.cube[giorno][inizio][aula] == null)
//                            this.cube[fields[0]][(start + i) + ':00'][fields[2]] = new Array();

			this.cube[giorno][inizio][aula] = sigla;
			jsdump ("--> " + giorno + " - " + inizio + " - " + aula + ": " + this.cube[giorno][inizio][aula]);
//                  }
                }
            } while(eof);

            for (var i in this.cube )
                for ( var j in i)
                    for (var x in j)
                        jsdump(i + ': ' +  j + ': ' + x);
            stream.close();
            var tree = document.getElementById("schedule");
        }
            
    }
    
};


function Text (){

    this.normalize = function(str) {
        return str.replace(/\n/g ,' ').toLowerCase();
    }
}


var rssRoundRobin = 0;
var scrollTextIntervalId = null;
var scrollTitleIntervalId = null;
var completeScrollText = true;
var completeScrollTitle = true;
function switchNewsTicker(rssSources){
    // selezione di un feed rss
    var rss = rssSources[rssRoundRobin].source;
    if (!rss.feeds || !completeScrollText || !completeScrollTitle) return; 

    if (rss.feeds.length > 0){
        var fx = new Effects();
        function next(){
            // acquisizione delle label
            var rssTitle = document.getElementById("rsstitle"); 
            var rssDate = document.getElementById("rssdate");
            var rssText = document.getElementById("rsstext");
            var rssTextScroll = document.getElementById('rsstextscroll');
            var rssTitleScroll = document.getElementById('rsstitlescroll');

            // visualizzazione dei valori delle label
            rssTitle.value = (new Text()).normalize(rss.feeds[0].title);
            rssDate.value = rss.feeds[0].pubdate.toLocaleDateString();
            rssText.value = (new Text()).normalize(rss.feeds[0].description);
            //rssText.textContent = (new Text()).normalize(rss.feeds[0].description);

            var scrolltext = rssTextScroll.boxObject
                .QueryInterface(Components.interfaces.nsIScrollBoxObject);
            var scrolltitle = rssTitleScroll.boxObject
                .QueryInterface(Components.interfaces.nsIScrollBoxObject);

            if (scrollTextIntervalId)
                clearInterval(scrollTextIntervalId);
            completeScrollText = false;
            scrollTextIntervalId = setInterval( function (scroll, obj ){
                var offset = obj.boxObject.screenX;
                scroll.scrollBy(10,0);
                if (obj.boxObject.screenX == offset)
                    completeScrollText = true;
            },  100, scrolltext, rssText);
            

            if (scrollTitleIntervalId)
                clearInterval(scrollTitleIntervalId);
            completeScrollTitle = false;
            scrollTitleIntervalId = setInterval( function (scroll, obj, direction){
                var offset = obj.boxObject.screenX;
                if (!direction)
                    scroll.scrollBy(10,0);
                else
                    scroll.scrollBy(-10,0);
                if (obj.boxObject.screenX == offset)
                    completeScrollTitle = true;
            }, 150, scrolltitle, rssTitle, false)
        } 

        //fx.curtain('newsticker', FXV_CURTAIN_CLOSE, next);
        //fx.curtain('newsticker', FXV_CURTAIN_OPEN, null);
        next();

        // ruota le news
        rss.feeds.push(rss.feeds.shift());
    }

    // cicla per selezionare il prossimo feed
    rssRoundRobin = (rssRoundRobin + 1) % rssSources.length;
}
