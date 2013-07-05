/*
 * Objects extensions and support functions
 */

// We love Python capitalize()!
String.prototype.capitalize = function(){
    return this.replace(/^(.?)/, this.charAt(0).toUpperCase());
}

String.prototype.normalize = function(){
    return this.replace(/\<[\/a-z \"=]*\>|\n/g,' ').toLowerCase();
}

String.prototype.splitenum = function(separator){
    var tokens = this.split(separator);
    var obj = {}
    for (var i=0; i< tokens.length; i++ ){
        obj[i] = tokens[i];
    }
    return obj;
}
