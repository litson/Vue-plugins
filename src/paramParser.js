var type    = require( './type' );

/**
 *
 * override
 *
 * @param url
 * @param data
 * @param success
 * @param dataType
 * @returns {{Object}}
 */
module.exports = function ( url, data, success, dataType ) {

    if ( 'function' === type( data ) ) {
        dataType = success;
        success  = data;
        data     = undefined;
    }

    if ( 'function' !== type( success ) ) {
        dataType = success;
        success  = undefined;
    }

    return {
        url     : url,
        data    : data,
        success : success,
        dataType: dataType
    }
};