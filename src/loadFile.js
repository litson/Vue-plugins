var type    = require( './type' );
var noop    = require( './noop' );
var forEach = require( './each' );
var extend  = Vue.util.extend;

var _mergeExceptUndefined = require( './mergeExcludeUndefined' );

var IS_CSS_RE = /\.css(?:\?|$)/i;

var _loadFileDefaultSetting = {
    url    : '',
    success: noop,
    error  : noop,
    props  : {}
};

/**
 *
 * 下载文件
 *
 *
 * e.g
 *
 *
 *      Args: url , onSuccess , onError , props
 *      1. loadFile(
 *                '//cdn.domain.cn/js/main.js' ,
 *              , function() { console.log('callBack') }
 *              , function() { console.log('Error happen!') }
 *              , { id: 'mainjs' }
 *         );
 *
 *
 *      Args: load a file list.
 *      2. loadFile( [
 *
 *          {
     *              url      : '//cdn.domain.cn/js/main.js',
     *              success  : function(){ console.log('callBack for url : //cdn.domain.cn/js/main.js ') },
     *              props    : {
     *                              id     : 'mainjs',
     *                              appKey : 'aJKckjkjdklaj2jJKssdIk'
     *                         }
     *          },
 *
 *          {
     *              url      : '//cdn.domain.cn/css/normalize.css',
     *              success  : function(){ console.log('callBack for url : //cdn.domain.cn/css/normalize.css ') }
     *          }
 *
 *      ] );
 *
 *
 *
 * @param filelist
 */
module.exports = function ( filelist ) {
    if ( 'array' !== type( filelist ) ) {
        filelist = _loadFileArgsParser( arguments.length, arguments );
    }

    forEach( filelist, function ( item, key ) {

        var temp = _mergeExceptUndefined(
            _loadFileDefaultSetting
            , item
        );

        _loadFile( temp.url, temp.success, temp.error, temp.props );

    } );
};


/**
 *
 *
 *
 * @param argsLength
 * @param arguments
 * @private
 */
function _loadFileArgsParser( length, args ) {

    // 1. url success error props
    // 2. url success error
    // 3. url success props
    // 4. url success
    // 5. url props
    // 6. url
    // 7. { url, success, error, props }

    var argsMapping = {
        /**
         *
         * {
             *      url,
             *      success,
             *      error,
             *      props
             * }
         *
         * or
         *
         * url
         *
         * @param args
         * @returns {object}
         */
        1: function ( args ) {

            if ( 'object' === type( args[0] ) ) {
                return args[0];
            }

            return {
                url: args[0]
            }
        },

        // url success || url props
        2: function ( args ) {

            var _type  = type( args[1] );
            var result = {
                url: args[0]
            };

            if ( 'function' === _type ) {
                result.success = args[1];
            } else {
                result.props = args[1];
            }

            return result;
        },

        // url success error || url success props
        3: function ( args ) {

            var _type  = type( args[2] );
            var result = {
                url    : args[0],
                success: args[1]
            };


            if ( 'function' === _type ) {
                result.error = args[2];
            } else {
                result.props = args[2];
            }

            return result;
        },

        // url success error props
        4: function ( args ) {
            return {
                url    : args[0],
                success: args[1],
                error  : args[2],
                props  : args[3]
            }
        }
    };

    return [argsMapping[length]( args )];
}


/**
 *
 * load file
 *
 * @param url
 * @param success
 * @param error
 * @param props
 * @private
 */
function _loadFile( url, success, error, props ) {

    var isCss        = IS_CSS_RE.test( url );
    var nodeName     = 'SCRIPT';
    var defaultProps = {
        type : 'text/javascript',
        async: true,
        src  : url
    };

    var header = document.head;

    if ( isCss ) {
        nodeName     = 'LINK';
        defaultProps = {
            rel : 'stylesheet',
            href: url
        }
    }

    var node = document.createElement( nodeName );

    // 合二为一
    node.onload = node.onerror = function ( event ) {
        (event.type === 'load') ? success( event ) : error( event );
        _clean( node );
        node = null;
    };

    extend(
        node,
        extend( props, defaultProps )
    );

    header.insertBefore( node, header.firstChild );

    function _clean( node ) {
        node.onload = node.onerror = null;

        // Css 文件在文档中被移除后，样式会更随丢失
        if ( isCss ) {
            return;
        }

        for ( var p in node ) {
            delete node[p];
        }

        header.removeChild( node );
    }
}