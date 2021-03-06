/**
 * url后附加query string
 *
 * @param url
 * @param query
 * @returns {string}
 */
module.exports = function ( url, query ) {
    return (query === '') ? url : (url + '&' + query).replace( /[&?]{1,2}/, '?' );
}