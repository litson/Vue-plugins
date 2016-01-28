var ajax        = require( './ajax' ).ajax;
var paramParser = require( './paramParser' );

/**
 *
 * Ajax, method 'post'.
 *
 * Vue.post( url [, data ] [, success(data, textStatus, XHR) ] [, dataType ] )
 *
 * @param url
 * @param data
 * @param success
 * @param dataType
 */
module.exports = function ( /* url, data, success, dataType */ ) {
    var options  = paramParser.apply( null, arguments );
    options.type = 'post';
    return ajax( options );
};