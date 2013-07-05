/*
 * FIle management library
 */

function LocalFile(fileName) {
    this.fileName = fileName;
    this.stream = null;
    this.open(fileName);
}

LocalFile.prototype = {
    //apertura del file
    open: function (fileName){
        if (!fileName && !this.fileName)
            throw new Error("File error", "No such file specified");
        if (fileName)
            this.fileName = fileName;
        var file = Components.classes["@mozilla.org/file/local;1"]
            .createInstance(Components.interfaces.nsILocalFile);
        file.initWithPath(this.fileName);
        if (!file.exists())
            return null;

        var inputStream = Components.classes["@mozilla.org/network/file-input-stream;1"]
            .createInstance(Components.interfaces.nsIFileInputStream);
        //apertura file in modalita' readonly
        inputStream.init(file, -1, -1, 0);
        this.stream = inputStream.QueryInterface(Components.interfaces.nsILineInputStream);
        jsdump("Function LocalFile.open: opened " + this.fileName);
        return true;
    },

    readline: function(data) {
        if (this.stream)
            return this.stream.readLine(data);
        data = null;
        return null;
    },

    close: function(){
        this.stream.close();
    }

}

function NetworkFile(fileName){
    this.fileName = fileName;
    this.stream = null;
    this.cursor = 0;
    this.open(fileName);
}

NetworkFile.prototype = {
    open: function(fileName){
        if (fileName)
            this.fileName = fileName;
        var conn = new XMLHttpRequest();
        conn.open('GET', fileName, false);
        conn.send(null);
        if (conn.status != 200)
            return false;
        else{
            jsdump("Function NetworkFile.open: opened " + this.fileName);
            this.stream = conn.responseText;
        }
        return true;
    },

    readline: function(data){
        var next = this.stream.indexOf('\n', this.cursor);
        data.value = this.stream.substr(this.cursor, (next > -1? next: false));
        data.length = data.value.length;
        this.cursor = this.stream.indexOf('\n', this.cursor) + 1;
        return (data.length? true: false);
    },

    close: function(){
        return;
    }
}

function LocalFileParser(stream){
    this.stream = stream;
}

LocalFileParser.prototype = {
    
    getfields: function(data){
        var str = {};
        var eof = this.stream.readline(str);
        if (!eof)
            return false;
        if (data.length > 0)
            data.splice(0, data.length);
        new String(str.value).split(' ; ')
            .forEach(function(elm, idx, array){
                this.push(elm);
            }, data
        );
        return true;
    },

    // campi del file current.gap:
    // giorno, sigla, aula, ora_inizio, ora_fine, docente, anno_corso, laurea, codice_corso = i.split(";") 
    
    const_day : 0,
    const_course : 1,
    const_room : 2,
    const_start : 3,
    const_stop : 4,
    const_people : 5,
    const_courseyear : 6,
    const_degree : 7,
    const_code : 8
}

