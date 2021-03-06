var forEach = require( './each' );

/**
 * 去掉undefined的属性
 * merge
 *
 * @param from
 * @param to
 * @returns {*}
 * @private
 */
module.exports = function ( from, to ) {
    forEach( from, function ( item, key ) {
        if ( to[key] === undefined ) {
            to[key] = item;
        }
    } );

    return to;
};