function jsdump(str)
{
  Components.classes['@mozilla.org/consoleservice;1']
              .getService(Components.interfaces.nsIConsoleService)
              .logStringMessage(str);
}

function debug(){
    //DEBUG
    window.open('chrome://global/content/console.xul', 'debug', 'toolbar=yes,menubar=yes,chrome,centerscreen');
}

function stats(){
    var stats = document.getElementById("stats");
    var info = Components.classes['@mozilla.org/xre/app-info;1']
                    .getService(Components.interfaces.nsIXULAppInfo);
    stats.firstChild.textContent = info.name + " (" +
                                   info.platformBuildID + " "+
                                   info.platformVersion + " "+
                                   info.OS + " "+
                                   info.XPCOMABI + ") "+
                                   ", running time: " + (new Date() - runtime) + "ms; "+
                                   rssSources.length + " feeds loaded;";
    stats.style.display = "block";
    setTimeout(function(elm){elm.style.display = "none"; }, 10000, stats);
}


