var ajax        = require( './ajax' ).ajax;
var paramParser = require( './paramParser' );

/**
 *
 * Ajax, method 'JSON'.
 *
 * Vue.getJSON( url [, data ] [, success(data, textStatus, XHR) ] [, dataType ] )
 *
 * @param url
 * @param data
 * @param success
 * @param dataType
 */
module.exports = function ( /* url, data, success, dataType */ ) {
    var options      = paramParser.apply( null, arguments );
    options.dataType = 'json';
    return ajax( options );
};