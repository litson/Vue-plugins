var loadFile     = require( './loadFile' );
var _ajaxHelpers = require( './ajaxHelpers' );
var noop         = require( './noop' );

/**
 * jsonp函数
 * @param options
 * @returns {*}
 */
module.exports = function ( options ) {

    // 黑魔法~
    var callbackName = options.jsonpCallback || 'jsonp' + setTimeout( '1' );
    var responseData;
    var abortTimeout;

    // 失败或成功后的回调
    function callBack( event ) {
        clearTimeout( abortTimeout );

        if ( event.type === 'error' || !responseData ) {
            _ajaxHelpers.error( null, 'error', {abort: noop}, options );
        } else {
            _ajaxHelpers.success( responseData[0], {abort: noop}, options );
        }
    }

    // 文件下载完成后，将返回值缓存起来
    window[callbackName] = function () {
        responseData = arguments;
    };

    if ( options.timeout > 0 ) {
        abortTimeout = setTimeout( function () {
            _ajaxHelpers.error( null, 'timeout', {abort: noop}, options );
        }, options.timeout );
    }

    return loadFile( {
        url    : options.url.replace( /\?(.+)=\?/, '?$1=' + callbackName ),
        success: callBack,
        error  : callBack
    } );
};