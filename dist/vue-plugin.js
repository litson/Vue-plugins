/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @file
	 * @fileoverview each / type / noop
	 * @authors      litson.zhang@gmail.com
	 * @date         2015.08.18
	 * @version      1.0.5
	 * @note         ajax 模块单拎出来
	 *               因为Vue版本升级后，启用Object.freeze冻结util中的属性
	 *               （这哥们真有代码洁癖，不知道什么样的人能给丫提PR）,
	 *               所以将插件放在信
	 */

	/* global module */
	// ==================== Bound to global Vue ==================== //
	'use strict';

	Vue.use( {
	    install: function ( Vue ) {

	        /**
	         * 如下配置可以跟进配置酌情注释，不会影响主功能；
	         *
	         * 一些变种函数如果注释掉打包后，可以更好的减少体积
	         *
	         * @type {{}}
	         */

	        Vue.plugin = Vue.plugin || {};

	        Vue.plugin.each  = __webpack_require__( 1 );
	        Vue.plugin.type  = __webpack_require__( 2 );
	        Vue.plugin.NOOP  = __webpack_require__( 3 );
	        Vue.plugin.param = __webpack_require__( 4 );

	        Vue.ready = __webpack_require__( 5 );

	        Vue.ajaxSettings = __webpack_require__( 6 ).ajaxSettings;
	        Vue.ajax         = __webpack_require__( 6 ).ajax;

	        // 变种函数
	        Vue.get      = __webpack_require__( 11 );
	        Vue.post     = __webpack_require__( 13 );
	        Vue.getJSON  = __webpack_require__( 14 );
	        Vue.loadFile = __webpack_require__( 16 );


	        Vue.$ = __webpack_require__( 10 );
	    }
	} );

/***/ },
/* 1 */
/***/ function(module, exports) {

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

/***/ },
/* 2 */
/***/ function(module, exports) {

	/**
	 * Get data type
	 * @param object
	 * @returns {string}
	 */
	module.exports = function ( object ) {
	    return Object.prototype.toString.call( object ).replace( /\[\object|\]|\s/gi, '' ).toLowerCase();
	};

/***/ },
/* 3 */
/***/ function(module, exports) {

	/**
	 * Do nothing.
	 */
	module.exports = function () {
	};

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var type    = __webpack_require__( 2 );
	var forEach = __webpack_require__( 1 );

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

/***/ },
/* 5 */
/***/ function(module, exports) {

	/* global Vue */
	var doc       = document;
	var isReady   = false;
	var readyRE   = /complete|loaded|interactive/;
	var eventType = 'DOMContentLoaded';

	var callBacks = [];

	if ( readyRE.test( doc['readyState'] ) ) {
	    setTimeout( fireEvent, 1 );
	} else {
	    doc.addEventListener( eventType, fireEvent, false );
	}

	function fireEvent() {

	    isReady = true;
	    doc.removeEventListener( eventType, fireEvent, false );

	    var fn;
	    while ( fn = callBacks.shift() ) {
	        fn( Vue );
	    }
	}

	/**
	 * Dom ready for Vue. bind to global Vue.
	 *
	 * E.g.
	 *
	 *      Vue.ready( function( Vue ) { console.log('Ready!',Vue); } );
	 *
	 * @param fn
	 */
	module.exports = function ( fn ) {
	    if ( isReady ) {
	        fn( Vue );
	    } else {
	        callBacks.push( fn );
	    }
	};

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @file
	 * @fileoverview Vue ajax
	 * @authors      litson.zhang@gmail.com
	 * @date         2015.08.18
	 * @version      1.0.7.2
	 * @note
	 *      看 plugin.js 的 log~
	 */

	/* global Vue */
	var extend  = Vue.util.extend;
	var noop    = __webpack_require__( 3 );
	var type    = __webpack_require__( 2 );
	var forEach = __webpack_require__( 1 );

	var appendQuery = __webpack_require__( 7 );
	var param       = __webpack_require__( 4 );
	var loadFile    = __webpack_require__( 16 );

	var _mergeExceptUndefined = __webpack_require__( 8 );

	var ajaxSettings = __webpack_require__( 9 );
	var _ajaxHelpers = __webpack_require__( 15 );

	var blankRE = /^\s*$/;

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

	    _mergeExceptUndefined( ajaxSettings, options );

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
	                _ajaxHelpers.success( null, null, options );
	            },
	            error  : function ( event ) {
	                _ajaxHelpers.error( event, 'error', null, options );
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
	                    _ajaxHelpers.error( error, 'parsererror', xhr, options );
	                } else {
	                    _ajaxHelpers.success( result, xhr, options );
	                }

	            } else {
	                _ajaxHelpers.error( xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, options );
	            }
	        }
	    };

	    if ( false === _ajaxHelpers.beforeSend( xhr, options ) ) {
	        xhr.abort();
	        _ajaxHelpers.error( null, 'abort', xhr, options );
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
	            _ajaxHelpers.error( null, 'timeout', xhr, options );
	        }, options.timeout );
	    }

	    xhr.send( options.data );

	    return xhr;
	}


	/**
	 * jsonp函数
	 * @param options
	 * @returns {*}
	 */
	function jsonPadding( options ) {

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

/***/ },
/* 7 */
/***/ function(module, exports) {

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

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var forEach = __webpack_require__( 1 );

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

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var noop       = __webpack_require__( 3 );

	module.exports = {
	    type       : 'GET',
	    url        : location.href,
	    data       : '',
	    dataType   : 'json',
	    cache      : true,
	    async      : true,
	    username   : null,
	    password   : null,
	    contentType: null,
	    xhrFields  : null,
	    context    : null,
	    timeout    : 0,
	    xhr        : function () {
	        return new window.XMLHttpRequest()
	    },
	    // 9月15日更新，加入dataFilter
	    dataFilter : null,
	    beforeSend : noop,
	    complete   : noop,
	    success    : noop,
	    error      : noop
	};

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	/* global module */
	/* global Vue */
	// ==================== vQuery ==================== //

	var doc  = document;
	var each = __webpack_require__( 1 );

	var makeArray = function ( arrayLike ) {
	    return Array.prototype.slice.call( arrayLike, 0 );
	};

	var vQuery = function ( selecter ) {
	    return new vQuery.fn.init( selecter );
	};

	/**
	 * ========= API集合 #start =========
	 */
	    // 简化库，bug多，见谅
	var proto = {
	    constructor: vQuery,
	    init       : function ( selecter ) {
	        var self = this;
	        var dom  = [];

	        if ( !selecter ) {
	            return dom;
	        }

	        // element || window
	        if (
	            selecter.nodeType
	            || (typeof selecter === 'object' && 'setInterval' in selecter)
	        ) {
	            dom = [selecter];
	        }

	        // selector
	        if ( typeof selecter === 'string' ) {
	            dom = makeArray( doc.querySelectorAll( selecter ), 0 );
	        }

	        each(
	            dom,
	            function ( item, index ) {
	                self[index] = item;
	            }
	        );

	        self.length   = dom.length;
	        dom.__proto__ = vQuery.fn;
	        return dom;

	    },
	    length     : 0
	};

	Vue.util.extend( proto, {

	    /**
	     * 实例长度
	     * @returns {number}
	     */
	    size: function () {
	        return this.length;
	    },

	    /**
	     * 添加样式
	     * @param value
	     * @returns {proto}
	     */
	    addClass: function ( value ) {
	        var length = this.length;
	        while ( length-- ) {
	            Vue.util.addClass( this[length], value );
	        }
	        return this;
	    },

	    /**
	     * 移除样式
	     * @param value
	     * @returns {proto}
	     */
	    removeClass: function ( value ) {
	        var length = this.length;
	        while ( length-- ) {
	            Vue.util.removeClass( this[length], value );
	        }
	        return this;
	    },

	    /**
	     * 移除dom
	     * @returns {proto}
	     */
	    remove: function () {
	        var length = this.length;
	        while ( length-- ) {
	            Vue.util.remove( this[length] );
	        }
	        return this;
	    },

	    /**
	     *
	     * 添加 attribute
	     *
	     * Vue不同版本处理不一样，早些版本是attr自动加Vue.config中的前缀，
	     * 1.0版本后才去掉了前缀，所以干脆这里重新实现了。
	     * @param name
	     * @param value
	     * @returns {*}
	     */
	    attr: function ( name, value ) {
	        if ( value == undefined ) {
	            return this[0].getAttribute( name );
	        }
	        var length = this.length;
	        while ( length-- ) {
	            this[length].setAttribute( name, value );
	        }
	        return this;
	    },

	    /**
	     * 移除 attribute
	     * @param name
	     * @returns {proto}
	     */
	    removeAttr: function ( name ) {
	        var length = this.length;
	        while ( length-- ) {
	            this[length].removeAttribute( name );
	        }
	        return this;
	    },

	    /**
	     *
	     * html
	     *
	     * 警告：大量的innerHtml会报错，jq中有fallback，将其打成元素append，这里很松散的没有做处理
	     *      数据量大时谨慎调用。
	     *      实验结果是，innerHTML对行数有限制，大于某阙值将溢出。
	     *
	     * @param value
	     * @returns {*}
	     */
	    html: function ( value ) {
	        if ( value == undefined ) {
	            return this[0].innerHTML;
	        }
	        var length = this.length;
	        while ( length-- ) {
	            this[length].innerHTML = value;
	        }
	        return this;
	    },

	    /**
	     * 显示
	     * show & hide 没有对之前的显示方式缓存，采用比较基础的切换display的方式。
	     * @returns {*}
	     */
	    show: function () {
	        return this.css( 'display', '' );
	    },

	    /**
	     * 隐藏
	     * show & hide 没有对之前的显示方式缓存，采用比较基础的切换display的方式。
	     * @returns {*}
	     */
	    hide: function () {
	        return this.css( 'display', 'none' );
	    },

	    /**
	     *
	     * 添加css，可能不是很好用
	     *
	     * @param name
	     * @param value
	     * @returns {*}
	     */
	    css: function ( name, value ) {

	        var length = this.length;

	        function parseUnit( number ) {
	            return typeof number === 'number' ? number + 'px' : number;
	        }

	        if ( Vue.util.isPlainObject( name ) ) {

	            var cssText = [''];
	            each( name, function ( item, key ) {
	                cssText.push(
	                    key + ':' + parseUnit( item )
	                )
	            } );
	            cssText.push( '' );
	            cssText = cssText.join( ';' );

	            while ( length-- ) {
	                this[length].style.cssText += cssText;
	            }

	        } else {
	            name = Vue.util.camelize( name );

	            if ( value == undefined ) {
	                return window.getComputedStyle( this[0], null )[name];
	            } else {
	                while ( length-- ) {
	                    this[length].style[name] = parseUnit( value );
	                }
	            }
	        }

	        return this;
	    },

	    /**
	     * 批量绑定，其他的没加
	     * @param type
	     * @param fn
	     * @returns {proto}
	     */
	    on: function ( type, fn ) {
	        var length = this.length;
	        while ( length-- ) {
	            Vue.util.on( this[length], type, fn );
	        }
	        return this;
	    },

	    /**
	     * 批量解除，其他的没加
	     * @param type
	     * @param fn
	     * @returns {proto}
	     */
	    off: function ( type, fn ) {
	        var length = this.length;
	        while ( length-- ) {
	            Vue.util.off( this[length], type, fn );
	        }
	        return this;
	    }
	} );


	/**
	 * 没有window和document
	 */
	each( ['width', 'height'], function ( key ) {

	    proto[key] = function ( value ) {

	        if ( value ) {
	            return this.css( key, typeof value === 'string' ? value : value + 'px' );
	        }

	        return this[0].getBoundingClientRect()[key];
	    }

	} );

	/* ========= API集合 #end ========= */

	// 原形变换
	vQuery.fn = vQuery.prototype = proto;
	vQuery.fn.init.prototype = vQuery.fn;

	module.exports = vQuery;

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var ajax        = __webpack_require__( 6 ).ajax;
	var paramParser = __webpack_require__( 12 );

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

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var type    = __webpack_require__( 2 );

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

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var ajax        = __webpack_require__( 6 ).ajax;
	var paramParser = __webpack_require__( 12 );

	/**
	 *
	 * Ajax, method 'post'.
	 *
	 * Vue.post( url [, data ] [, success(data, textStatus, XHR) ] [, dataType ] )
	 *
	 * @param url
	 * @param data
	 * @param success
	 * @param dataType
	 */
	module.exports = function ( /* url, data, success, dataType */ ) {
	    var options  = paramParser.apply( null, arguments );
	    options.type = 'post';
	    return ajax( options );
	};

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var ajax        = __webpack_require__( 6 ).ajax;
	var paramParser = __webpack_require__( 12 );

	/**
	 *
	 * Ajax, method 'JSON'.
	 *
	 * Vue.getJSON( url [, data ] [, success(data, textStatus, XHR) ] [, dataType ] )
	 *
	 * @param url
	 * @param data
	 * @param success
	 * @param dataType
	 */
	module.exports = function ( /* url, data, success, dataType */ ) {
	    var options      = paramParser.apply( null, arguments );
	    options.dataType = 'json';
	    return ajax( options );
	};

/***/ },
/* 15 */
/***/ function(module, exports) {

	module.exports = {
	    error     : function ( error, type, xhr, options ) {
	        var context = options.context;
	        options.error.call( context, xhr, type, error );
	    },
	    success   : function ( data, xhr, options ) {
	        var context = options.context;
	        options.success.call( context, data, 'success', xhr );
	    },
	    beforeSend: function ( xhr, options ) {
	        var context = options.context;
	        if ( options.beforeSend.call( context, xhr, options ) === false ) {
	            return false;
	        }
	    }
	};

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var type    = __webpack_require__( 2 );
	var noop    = __webpack_require__( 3 );
	var forEach = __webpack_require__( 1 );
	var extend  = Vue.util.extend;

	var _mergeExceptUndefined = __webpack_require__( 8 );

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

/***/ }
/******/ ]);