var ajax        = require( './ajax' ).ajax;
var paramParser = require( './paramParser' );

/**
 *
 *
 * Ajax, method 'get'.
 *
 * Vue.get( url [, data ] [, success(data, textStatus, XHR) ] [, dataType ] )
 *
 * @param url
 * @param data
 * @param success
 * @param dataType
 */
module.exports = function ( /* url, data, success, dataType */ ) {
    return ajax( paramParser.apply( null, arguments ) );
};