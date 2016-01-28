var type    = require( './type' );
var forEach = require( './each' );

/**
 *
 * 序列化参数
 *
 * @param elements
 * @param traditional
 * @returns {string}
 */
module.exports = function ( elements, traditional ) {
    var result = [];
    result.add = function ( item, key ) {

        // If value is a function, invoke it and return its value
        if ( 'function' === type( item ) ) {
            item = item();
        }

        if ( null == item ) {
            item = '';
        }

        result[result.length] = encodeURIComponent( key ) + '=' + encodeURIComponent( item );

    };

    // http://www.w3school.com.cn/jquery/ajax_param.asp
    _buildParam( result, elements, traditional );

    return result.join( '&' ).replace( /%20/g, '+' );
};


/**
 *
 * 处理多纬数组
 *
 * E.g
 *
 * var params = {
     *
     *      items: {  testBbject: 1 },
     *      test2: [1, 2, 3]
     *
     * }
 *
 * Use jQuery or Zepto:
 *      decodeURIComponent( $.param( params ) );
 *      // output: items[testBbject]=1&test2[]=1&test2[]=3&test2[]=4
 *
 *
 * Use Vue.plugin.param
 *      decodeURIComponent( Vue.plugin.param( params ) );
 *      // output: items[testBbject]=1&test2[]=1&test2[]=3&test2[]=4
 *
 *
 *
 *
 * @param params
 * @param elements
 * @param traditional
 * @param prefix
 * @private
 */
function _buildParam( params, elements, traditional, prefix ) {

    var isPlainObject = 'object' === type( elements );

    forEach( elements, function ( item, key ) {

        var _type          = type( item );
        var _isPlainObject = 'object' === _type;
        var _isArray       = 'array' === _type;

        if ( prefix ) {

            if ( traditional ) {
                key = prefix;
            } else {
                key =
                    [
                        prefix
                        , '['
                        , (isPlainObject || _isPlainObject || _isArray) ? key : ''
                        , ']'
                    ].join( '' );
            }
        }

        /**
         * 因为这里不需要对form DOM 做扫描
         * 所以和 $.param 不同的是，去掉了 serializeArray 的format
         */
        if ( _isArray || (!traditional && _isPlainObject) ) {
            _buildParam( params, item, traditional, key );
        } else {
            params.add( item, key );
        }

    } );

}