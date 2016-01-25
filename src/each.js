/* global module */

'use strict';

/**
 * ref: http://devdocs.io/javascript/global_objects/array/foreach
 *
 * The each() method executes a provided function once per array or object literal element.
 *
 * 原生 forEach 在 return false 后会自动 break,这里对象字面量的循环延续该特性.
 *
 * @param elements
 * @param callBack
 */
module.exports = function ( elements, callBack ) {
    if ( !elements ) {
        return;
    }

    if ( elements.forEach ) {
        return elements.forEach( callBack );
    }

    for ( var key in elements ) {
        if ( elements.hasOwnProperty( key ) && callBack( elements[key], key, elements ) === false ) {
            break;
        }
    }
};