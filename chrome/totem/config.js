function config(){
    //finestra about:config
    window.open('about:config', 'debug', 'toolbar=yes,menubar=yes,chrome,centerscreen');
}

var Config ={

    prefs: Components.classes["@mozilla.org/preferences-service;1"]
        .getService(Components.interfaces.nsIPrefBranch),
    
    getPrefs: function (str){
        var value = null;
        var prefs = new Array (
                this.prefs.getCharPref,
                this.prefs.getIntPref,
                this.prefs.getBoolPref
            );
        for (var i = 0; i < prefs.length; i++)
            try {
                value = prefs[i]("totem."+str);
            } catch (e) { }
        return value;
    }
}
