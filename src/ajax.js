/* global Vue */

var noop                  = require( './noop' );
var type                  = require( './type' );
var param                 = require( './param' );
var extend                = Vue.util.extend;
var blankRE               = /^\s*$/;
var forEach               = require( './each' );
var loadFile              = require( './loadFile' );
var appendQuery           = require( './appendQuery' );
var jsonPadding           = require( './ajaxJsonPadding' );
var ajaxHelpers           = require( './ajaxHelpers' );
var ajaxSettings          = require( './ajaxSettings' );
var mergeExcludeUndefined = require( './mergeExcludeUndefined' );

// Output
module.exports = {
    ajaxSettings: ajaxSettings,
    ajax        : ajax
};

/**
 *
 *
 *
 *
 * @version 1.0.0 lite版ajax接口
 *
 *
 *
 * @param options
 */
function ajax( options ) {

    var hashIndex;
    var dataType;
    var xhr;
    var abortTimer;
    var hasPlaceholder;
    var protocol = /^([\w-]+:)\/\//.test( options.url ) ? RegExp.$1 : window.location.protocol;

    mergeExcludeUndefined( ajaxSettings, options );

    if ( !options.crossDomain ) {
        options.crossDomain =
            /^([\w-]+:)?\/\/([^\/]+)/.test( options.url )
            && RegExp.$2 != window.location.host;
    }

    // 过滤掉hash
    hashIndex = options.url.indexOf( '#' );

    if ( hashIndex > -1 ) {
        options.url = options.url.slice( 0, hashIndex );
    }

    // 将参数附件在url上
    serializeData( options );

    dataType = options.dataType;

    // 双问号存在，说明为jsonp请求
    hasPlaceholder = /\?.+=\?/.test( options.url );
    if ( hasPlaceholder ) {
        dataType = 'jsonp';
    }

    // ajax cache
    if (
        !options.cache
        || 'script' === dataType
        || 'jsonp' === dataType
    ) {
        options.url = appendQuery( options.url, '_t=' + +new Date );
    }

    // 不走 xhr + eval 的加载脚本方式，改为外联。保证没有跨域问题,而且性能上成
    if ( 'script' === dataType ) {
        // options.timeout && console.log('Sorry, dataType == script 暂不支持timeout');
        return loadFile( {
            url    : options.url,
            success: function () {
                ajaxHelpers.success( null, null, options );
            },
            error  : function ( event ) {
                ajaxHelpers.error( event, 'error', null, options );
            },
            props  : {}
        } );
    }

    // jsonp
    if ( 'jsonp' === dataType ) {
        return jsonPadding( options );
    }

    // xhr 实例
    xhr = options.xhr();

    var headers = extend( {}, options.headers || {} );

    if ( !options.crossDomain ) {
        headers['X-Requested-With'] = 'XMLHttpRequest';
    }

    if (
        options.contentType
        ||
        ( options.data && options.type.toUpperCase() != 'GET' )
    ) {
        headers['Content-Type'] = options.contentType || 'application/x-www-form-urlencoded';
    }

    xhr['onreadystatechange'] = function () {

        if ( xhr.readyState === 4 ) {
            xhr['onreadystatechange'] = noop;
            clearTimeout( abortTimer );

            var result;
            var error = false;

            if ( (xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:') ) {

                result = xhr.responseText;

                // jQuery 有 converters 集合，这里从实现上没有这么做，可能会有些问题无法捕获
                if ( 'function' === type( options.dataFilter ) ) {

                    result = options.dataFilter( result, dataType );

                } else {

                    try {
                        if ( 'xml' === dataType ) {
                            result = xhr.responseXML;
                        }

                        if ( 'json' === dataType ) {
                            result = blankRE.test( result ) ? null : JSON.parse( result + '' );
                        }
                    } catch ( ex ) {
                        error = ex;
                    }
                }

                if ( error ) {
                    ajaxHelpers.error( error, 'parsererror', xhr, options );
                } else {
                    ajaxHelpers.success( result, xhr, options );
                }

            } else {
                ajaxHelpers.error( xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, options );
            }
        }
    };

    if ( false === ajaxHelpers.beforeSend( xhr, options ) ) {
        xhr.abort();
        ajaxHelpers.error( null, 'abort', xhr, options );
        return xhr;
    }

    // xhr 额外字段
    if ( options.xhrFields ) {
        forEach( options.xhrFields, function ( item, key ) {
            xhr[key] = item;
        } );
    }

    // open
    xhr.open( options.type.toUpperCase(), options.url, options.async, options.username, options.password );

    // 请求头设置，一次性push
    forEach( headers, function ( item, key ) {
        xhr.setRequestHeader( key, item );
    } );

    // ajax timeout
    if ( options.timeout > 0 ) {

        abortTimer = setTimeout( function () {
            xhr.onreadystatechange = noop;
            xhr.abort();
            ajaxHelpers.error( null, 'timeout', xhr, options );
        }, options.timeout );
    }

    xhr.send( options.data );

    return xhr;
}

/**
 * Serialize data to string.
 *
 * @param options
 */
function serializeData( options ) {
    if ( options.data && type( options.data ) !== 'string' ) {
        options.data = param( options.data );
    }

    if ( options.data && options.type.toLocaleLowerCase() === 'get' ) {
        options.url  = appendQuery( options.url, options.data );
        options.data = undefined;
    }
}