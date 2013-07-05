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
