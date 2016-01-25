/* global module */

'use strict';
/**
 * Get data type
 * @param object
 * @returns {string}
 */
module.exports = function ( object ) {
    return Object.prototype.toString.call( object ).replace( /\[\object|\]|\s/gi, '' ).toLowerCase();
};