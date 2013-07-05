function config(){
    //finestra about:config
    window.open('about:config', 'debug', 'toolbar=yes,menubar=yes,chrome,centerscreen');
}

var Config ={

    prefs: Components.classes["@mozilla.org/preferences-service;1"]
        .getService(Components.interfaces.nsIPrefBranch),
    
    getPrefs: function (str){
        try {
            return this.prefs.getCharPref("totem."+str);
        } catch (e) {
            return null;
        }
    }
}
