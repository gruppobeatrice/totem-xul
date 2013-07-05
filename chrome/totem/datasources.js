/*
 * Manipolazione di feed RSS, datasource RDF, file, ecc.
 */


function RSSData(source){

    this.source = source;
    this.feeds = new Array();
    // richieste documenti asincrone
    this.req = new XMLHttpRequest();
    this.req.mozBackgroundRequest = true;

    setTimeout(this.Init, 1000, this);
}

RSSData.prototype= {

    // Creazione oggetti feed
    readystatechange: function(thisObj){
        if (thisObj.req.status == 200){
            thisObj.req.xml =  thisObj.req.responseText;  
            var feedparser = Components.classes["@mozilla.org/feed-processor;1"]
                .createInstance(Components.interfaces.nsIFeedProcessor);
            feedparser.listener = thisObj;
            feedparser.parseFromString(thisObj.req.xml,
                                       Components.classes["@mozilla.org/network/io-service;1"]
                                       .getService(Components.interfaces.nsIIOService)
                                       .newURI("file:///tmp/" + thisObj.source.replace(/[^\w]/g,''), null, null));
        }
    },
    //this.req.onreadystatechange = 
    // Init permette di ricaricare in modo asincrono il feed ogni ora
    Init: function(thisObj){
        thisObj.req.open('GET', thisObj.source, true);//false);
        thisObj.req.overrideMimeType('text/xml');
        thisObj.req.send(null);


        thisObj.req.onreadystatechange = function(){thisObj.readystatechange(thisObj);};

    },

    // listener per gli eventi del feed
    handleResult: function (result){
        var time = new Date();
        if (!result || !result.doc)
            return;
        var feedTemp = new Array();
        var feed = result.doc.QueryInterface(Components.interfaces.nsIFeed);
        if (!feed.items.length)
            return;
        for (var i=0; i<feed.items.length; i++){
            var feeditem = feed.items.queryElementAt(i,
                Components.interfaces.nsIFeedEntry);
            try{
                feedTemp.push({title: feeditem.title.plainText(),
                      pubdate: new Date(feeditem.updated),
                      description: (feeditem.summary?feeditem.summary.plainText():feeditem.content.plainText()),
                      longdescription: (feeditem.content?feeditem.content.plainText(): "")
                      });
                } catch (e) {break;}
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
        if (!feedTemp[0]) return;
        var comparedate = feedTemp[0].pubdate;
        this.feeds.push(feedTemp.shift());
        this.feeds = this.feeds.concat(feedTemp.filter(function(element, index, array){
            return comparedate - element.pubdate <= 604800000; // 7 giorni
        }, this));
    },
    
    reload: function(){
        this.Init(this);
    }

}


function RDFData() {
    
    // Inizializzazione RDF Service
    this.RDF= Components.classes["@mozilla.org/rdf/rdf-service;1"]
        .getService(Components.interfaces.nsIRDFService);

    this.ds= Components.classes["@mozilla.org/rdf/datasource;1?name=xml-datasource"]
        .createInstance(Components.interfaces.nsIRDFDataSource);
}

RDFData.prototype = {
    //inserimento di un nodo nel grafo rdf
    assert: function(source, property, target){
        var _source = (typeof source == "string"? this.RDF.GetResource(source): source);
        var _property = (typeof property == "string"? this.RDF.GetResource(property): property);
        var _target = (typeof target == "string"? this.RDF.GetResource(target): target);
        this.ds.Assert(
            _source,
            _property,
            _target,
            true
        );
    },

    /* generate popola il grafo RDF a partire da un
     * generico stream e un parser ad esso associato
     */ 
    generate: function (stream, parser){
        var time = new Date();
        if (stream){
            var eof ;
            var days = {};
            var hours = {};
            var courses = {};
            var halls = {};
            var people = {};

            do{
                var fields = new Array();
                eof = parser.getfields(fields);
                if (eof){
                    // if giorno non presente
                    if (!days[fields[parser.const_day]]){
                        days[fields[parser.const_day]] = this.RDF.GetAnonymousResource();
                        this.assert(//"urn:day-" + fields[parser.const_day],
                                    days[fields[parser.const_day]],
                                    "http://home.netscape.com/NC-rdf#day",
                                    this.RDF.GetLiteral(fields[parser.const_day]));
                    }
                    // if corso non presente
                    if (!courses[fields[parser.const_course]]){
                        courses[fields[parser.const_course]] = this.RDF.GetAnonymousResource();
                        this.assert(//"urn:course-" + fields[parser.const_course],
                                    courses[fields[parser.const_course]],
                                    "http://home.netscape.com/NC-rdf#course",
                                    this.RDF.GetLiteral(fields[parser.const_course]));
                    }
                    //if aula non presente
                    if (!halls[fields[parser.const_room]]){
                        halls[fields[parser.const_room]] = this.RDF.GetAnonymousResource(); 
                        this.assert(//"urn:hall-" + fields[parser.const_room],
                                    halls[fields[parser.const_room]],
                                    "http://home.netscape.com/NC-rdf#hall",
                                    this.RDF.GetLiteral(fields[parser.const_room]));
                    }
                    //if ora non presente
                    if (!hours[fields[parser.const_start]]){
                        hours[fields[parser.const_start]] = this.RDF.GetAnonymousResource();
                        this.assert(//"urn:hours-" + fields[parser.const_start],
                                    hours[fields[parser.const_start]],
                                    "http://home.netscape.com/NC-rdf#hours",
                                    this.RDF.GetLiteral(fields[parser.const_start]));
                    }
                    //if ora non presente
                    if (!hours[fields[parser.const_stop]]){
                        hours[fields[parser.const_stop]] = this.RDF.GetAnonymousResource();
                        this.assert(//"urn:hours-" + fields[parser.const_stop],
                                    hours[fields[parser.const_stop]],
                                    "http://home.netscape.com/NC-rdf#hours",
                                    this.RDF.GetLiteral(fields[parser.const_stop]));
                    }
                    this.assert(//"urn:course-" + fields[parser.const_course],
                                courses[fields[parser.const_course]],
                                "http://home.netscape.com/NC-rdf#people",
                                this.RDF.GetLiteral(fields[parser.const_people]));
                    this.assert(//"urn:course-" + fields[parser.const_course],
                                courses[fields[parser.const_course]],
                                "http://home.netscape.com/NC-rdf#courseyear",
                                this.RDF.GetLiteral(fields[parser.const_courseyear]));
                    this.assert(//"urn:course-" + fields[parser.const_course],
                                courses[fields[parser.const_course]],
                                "http://home.netscape.com/NC-rdf#degree",
                                this.RDF.GetLiteral(fields[parser.const_degree]));
                    this.assert(//"urn:course-" + fields[parser.const_course],
                                courses[fields[parser.const_course]],
                                "http://home.netscape.com/NC-rdf#code",
                                this.RDF.GetLiteral(fields[parser.const_code]));

                    var ass = this.RDF.GetAnonymousResource();
                    this.assert(ass,
                                "http://home.netscape.com/NC-rdf#start",
                                hours[fields[parser.const_start]]
                                );
                    this.assert(ass,
                                "http://home.netscape.com/NC-rdf#stop",
                                hours[fields[parser.const_stop]]
                                );

                    this.assert(ass,
                                "http://home.netscape.com/NC-rdf#course",
                                courses[fields[parser.const_course]]
                                );
                    this.assert(ass,
                                "http://home.netscape.com/NC-rdf#hall",
                                halls[fields[parser.const_room]]
                                );
                    this.assert(ass,
                                "http://home.netscape.com/NC-rdf#day",
                                days[fields[parser.const_day]]
                                );
                    this.ds.Assert(
                        this.RDF.GetResource("urn:root"),
                                this.RDF.GetResource("http://home.netscape.com/NC-rdf#child"),
                        ass,
                        true
                            );

                    
                }
            }
            while(eof);
            jsdump("Function RDFData.generate: " + (new Date() - time) + "ms");
            var outputStream = {
              data: "",
              close : function(){},
              flush : function(){},
              write : function (buffer,count){
                this.data += buffer;
                return count;
              },
              writeFrom : function (stream,count){},
              isNonBlocking: false
            }

            this.ds.QueryInterface(Components.interfaces.nsIRDFXMLSource);
            this.ds.Serialize(outputStream);
    
            //jsdump(outputStream.data);
            stream.close();
            return true;

        }
        return false; 
    },

    iterator: function() {
        
        // generazione data e ora
        var now = new Date();

        var Iterator = {
                items: new Array(),
                nextvalue: -1,
                next: function(){
                    this.nextvalue = (this.nextvalue + 1) % this.items.length;
                    if (this.nextvalue < this.items.length)
                        return this.items[this.nextvalue];
                    return null;
                },
                hasmoreelements: function(){
                    return this.nextvalue < this.items.length -1;
                }
            };

        // acquisizione nodi data corrente
        try {
            var day = this.ds.GetSource(
                            this.RDF.GetResource(
                                "http://home.netscape.com/NC-rdf#day"),
                            this.RDF.GetLiteral(now.getDay()),
                            true)
                        .QueryInterface(Components.interfaces.nsIRDFResource);
            var nodes = this.ds.GetSources(
                            this.RDF.GetResource(
                                "http://home.netscape.com/NC-rdf#day"), 
                            day, 
                            true);
        } catch (e) { return Iterator };
        //var dbg = Math.round(Math.random()*10 + 7 ); //DEBUG!!!
        //jsdump(dbg); //DEBUG!!! 
        while (nodes.hasMoreElements()){
            var item = nodes.getNext().QueryInterface(
                            Components.interfaces.nsIRDFResource);
            var start = this.ds.GetTarget(
                            item,
                            this.RDF.GetResource(
                                "http://home.netscape.com/NC-rdf#start"),
                            true)
                            .QueryInterface(
                                Components.interfaces.nsIRDFResource);
            var start_d = this.ds.GetTarget(
                            start,
                            this.RDF.GetResource(
                                "http://home.netscape.com/NC-rdf#hours"),
                            true )
                            .QueryInterface(
                                Components.interfaces.nsIRDFLiteral);
            var stop = this.ds.GetTarget(
                            item,
                            this.RDF.GetResource(
                                "http://home.netscape.com/NC-rdf#stop"),
                            true)
                            .QueryInterface(
                                Components.interfaces.nsIRDFResource);
            var stop_d = this.ds.GetTarget(
                            stop,
                            this.RDF.GetResource("http://home.netscape.com/NC-rdf#hours"),
                            true)
                            .QueryInterface(
                                Components.interfaces.nsIRDFLiteral);

            var starttime = new Date();
            var stoptime = new Date();
            var currenttime = new Date();
            var nexttime = new Date();
            //currenttime.setHours(dbg); // DEBUG!!!
            nexttime.setHours(currenttime.getHours() + 1 );
            
            starttime.setHours(start_d.Value.split(':')[0]);
            starttime.setMinutes(start_d.Value.split(':')[1]);
            stoptime.setHours(stop_d.Value.split(':')[0]);
            stoptime.setMinutes(stop_d.Value.split(':')[1]);

            if ((starttime <= currenttime // E' iniziato
                    && currenttime <= stoptime) //non e' ancora finito
                || (currenttime <= starttime  //non e' iniziato
                    && starttime <= nexttime) //inizia tra massimo un'ora
               )
                Iterator.items.push(
                {
                    course: this.ds.GetTarget(
                                this.ds.GetTarget(
                                    item,
                                    this.RDF.GetResource("http://home.netscape.com/NC-rdf#course"), 
                                    true
                                ).QueryInterface(
                                    Components.interfaces.nsIRDFResource),
                                this.RDF.GetResource("http://home.netscape.com/NC-rdf#course"),
                                true
                            ).QueryInterface(
                                Components.interfaces.nsIRDFLiteral),
                    hall: this.ds.GetTarget(
                                this.ds.GetTarget(
                                    item,
                                    this.RDF.GetResource("http://home.netscape.com/NC-rdf#hall"), 
                                    true
                                ).QueryInterface(
                                    Components.interfaces.nsIRDFResource),
                                this.RDF.GetResource("http://home.netscape.com/NC-rdf#hall"),
                                true
                            ).QueryInterface(
                                Components.interfaces.nsIRDFLiteral),
                    people: this.ds.GetTarget(
                                this.ds.GetTarget(
                                    item,
                                    this.RDF.GetResource("http://home.netscape.com/NC-rdf#course"), 
                                    true
                                ).QueryInterface(
                                    Components.interfaces.nsIRDFResource),
                                this.RDF.GetResource("http://home.netscape.com/NC-rdf#people"),
                                true
                            ).QueryInterface(
                                Components.interfaces.nsIRDFLiteral),
                    start: starttime,
                    stop: stoptime
                }
                );
        }
        return Iterator;
    }
};

