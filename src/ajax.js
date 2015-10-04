/**
 * @file
 * @fileoverview Vue ajax
 * @authors      litson.zhang@gmail.com
 * @date         2015.08.18
 * @version      1.0.7.1
 * @note
 */

/* global Vue */


// ==================== Bound to global Vue ==================== //

function install(Vue) {
    Vue.util.param = param;

    Vue.ajax = ajax;
    Vue.get = ajaxGet;
    Vue.post = ajaxPost;
    Vue.loadFile = loadFile;
    Vue.getJSON = ajaxGetJSON;

    // 将Vue-plugin的API签名打包到vueExpose中，方便作者查看
    Vue.vueExpose = Vue.vueExpose || [];
    Vue.vueExpose.push.apply(Vue.vueExpose, [
        'ajaxSetting',
        'util.param',
        'ajax',
        'post',
        'get',
        'loadFile',
        'getJSON'
    ]);

    console.log('[ Vuejs < ajax module > installation success! ]');
}

var extend = Vue.util.extend;
var noop = Vue.util.NOOP;
var type = Vue.util.type;
var forEach = Vue.util.each;

/**
 *
 * 序列化参数
 *
 * @param elements
 * @param traditional
 * @returns {string}
 */
function param(elements, traditional) {

    var result = [];

    result.add = function (item, key) {

        // If value is a function, invoke it and return its value
        if ('function' === type(item)) {
            item = item();
        }

        if (null == item) {
            item = '';
        }

        result[result.length] = encodeURIComponent(key) + '=' + encodeURIComponent(item);

    };

    // http://www.w3school.com.cn/jquery/ajax_param.asp
    _buildParam(result, elements, traditional);

    return result.join('&').replace(/%20/g, '+');

}

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
 * Use Vue.util.param
 *      decodeURIComponent( Vue.util.param( params ) );
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
function _buildParam(params, elements, traditional, prefix) {

    var isPlainObject = 'object' === type(elements);

    forEach(elements, function (item, key) {

        var _type = type(item);
        var _isPlainObject = 'object' === _type;
        var _isArray = 'array' === _type;

        if (prefix) {

            if (traditional) {
                key = prefix;
            } else {
                key = [

                    prefix
                    , '['
                    , (isPlainObject || _isPlainObject || _isArray) ? key : ''
                    , ']'


                ].join('');
            }
        }

        /**
         * 因为这里不需要对form DOM 做扫描
         * 所以和 $.param 不同的是，去掉了 serializeArray 的format
         */
        if (_isArray || (!traditional && _isPlainObject)) {
            _buildParam(params, item, traditional, key);
        } else {
            params.add(item, key);
        }

    });

}

// Vue Ajax Default Options.
Vue.ajaxSettings = {
    type: 'GET',
    url: location.href,

    data: '',
    dataType: 'json',
    cache: true,

    async: true,
    username: null,
    password: null,
    contentType: null,
    xhrFields: null,

    context: null,
    timeout: 0,

    xhr: function () {
        return new window.XMLHttpRequest()
    },

    // 9月15日更新，加入dataFilter
    dataFilter: null,
    beforeSend: noop,
    complete: noop,
    success: noop,
    error: noop
};

var blankRE = /^\s*$/;

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
function ajax(options) {

    var hashIndex;
    var dataType;
    var xhr;
    var abortTimer;
    var hasPlaceholder;

    var protocol = /^([\w-]+:)\/\//.test(options.url) ? RegExp.$1 : window.location.protocol;

    _mergeExceptUndefined(Vue.ajaxSettings, options);

    if (!options.crossDomain) {
        options.crossDomain =
            /^([\w-]+:)?\/\/([^\/]+)/.test(options.url)
            && RegExp.$2 != window.location.host;
    }


    // 过滤掉hash
    hashIndex = options.url.indexOf('#');

    if (hashIndex > -1) {
        options.url = options.url.slice(0, hashIndex);
    }

    // 将参数附件在url上
    serializeData(options);

    dataType = options.dataType;

    // 双问号存在，说明为jsonp请求
    hasPlaceholder = /\?.+=\?/.test(options.url);
    if (hasPlaceholder) {
        dataType = 'jsonp';
    }

    // ajax cache
    if (
        !options.cache
        || 'script' === dataType
        || 'jsonp' === dataType
    ) {
        options.url = appendQuery(options.url, '_t=' + +new Date);
    }

    // 不走 xhr + eval 的加载脚本方式，改为外联。保证没有跨域问题,而且性能上成
    if ('script' === dataType) {
        // options.timeout && console.log('Sorry, dataType == script 暂不支持timeout');
        return Vue.loadFile({
            url: options.url,
            success: function () {
                _ajaxHelpers.success(null, null, options);
            },
            error: function (event) {
                _ajaxHelpers.error(event, 'error', null, options);
            },
            props: {}
        });
    }

    // jsonp
    if ('jsonp' === dataType) {
        return jsonPadding(options);
    }

    // xhr 实例
    xhr = options.xhr();

    var headers = extend({}, options.headers || {});

    if (!options.crossDomain) {
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

        if (xhr.readyState === 4) {
            xhr['onreadystatechange'] = noop;
            clearTimeout(abortTimer);

            var result;
            var error = false;

            if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {

                result = xhr.responseText;

                // jQuery 有 converters 集合，这里从实现上没有这么做，可能会有些问题无法捕获
                if ('function' === type(options.dataFilter)) {

                    result = options.dataFilter(result, dataType);

                } else {

                    try {
                        if ('xml' === dataType) {
                            result = xhr.responseXML;
                        }

                        if ('json' === dataType) {
                            result = blankRE.test(result) ? null : JSON.parse(result + '');
                        }
                    } catch (ex) {
                        error = ex;
                    }

                }


                if (error) {
                    _ajaxHelpers.error(error, 'parsererror', xhr, options);
                } else {
                    _ajaxHelpers.success(result, xhr, options);
                }

            } else {
                _ajaxHelpers.error(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, options);
            }

        }

    };

    if (false === _ajaxHelpers.beforeSend(xhr, options)) {
        xhr.abort();
        _ajaxHelpers.error(null, 'abort', xhr, options);
        return xhr;
    }

    // xhr 额外字段
    if (options.xhrFields) {
        forEach(options.xhrFields, function (item, key) {
            xhr[key] = item;
        });
    }

    // open
    xhr.open(options.type.toUpperCase(), options.url, options.async, options.username, options.password);

    // 请求头设置，一次性push
    forEach(headers, function (item, key) {
        xhr.setRequestHeader(key, item);
    });

    // ajax timeout
    if (options.timeout > 0) {

        abortTimer = setTimeout(function () {
            xhr.onreadystatechange = noop;
            xhr.abort();
            _ajaxHelpers.error(null, 'timeout', xhr, options);
        }, options.timeout);
    }

    xhr.send(options.data);

    return xhr;
}

var _ajaxHelpers = {
    error: function (error, type, xhr, options) {
        var context = options.context;
        options.error.call(context, xhr, type, error);
    },
    success: function (data, xhr, options) {
        var context = options.context;


        options.success.call(context, data, 'success', xhr);
    },
    beforeSend: function (xhr, options) {
        var context = options.context;
        if (options.beforeSend.call(context, xhr, options) === false) {
            return false;
        }
    }
}

/**
 * 去掉undefined的属性
 * merge
 *
 * @param from
 * @param to
 * @returns {*}
 * @private
 */
function _mergeExceptUndefined(from, to) {
    forEach(from, function (item, key) {

        if (to[key] === undefined) {
            to[key] = item;
        }

    });

    return to;
}

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
function ajaxGet(/* url, data, success, dataType */) {
    return Vue.ajax(_paramParser.apply(null, arguments));
}

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
function ajaxPost(/* url, data, success, dataType */) {
    var options = _paramParser.apply(null, arguments);
    options.type = 'post';
    return Vue.ajax(options);
}

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
function ajaxGetJSON(/* url, data, success, dataType */) {
    var options = _paramParser.apply(null, arguments);
    options.dataType = 'json';
    return Vue.ajax(options);
}

/**
 * jsonp函数
 * @param options
 * @returns {*}
 */
function jsonPadding(options) {

    // 黑魔法~
    var callbackName = options.jsonpCallback || 'jsonp' + setTimeout('1');

    var responseData;
    var abortTimeout;

    // 失败或成功后的回调
    function callBack(event) {
        clearTimeout(abortTimeout);

        if (event.type === 'error' || !responseData) {
            _ajaxHelpers.error(null, 'error', {abort: noop}, options);
        } else {
            _ajaxHelpers.success(responseData[0], {abort: noop}, options);
        }
    }

    // 文件下载完成后，将返回值缓存起来
    window[callbackName] = function () {
        responseData = arguments;
    }

    if (options.timeout > 0) {
        abortTimeout = setTimeout(function () {
            _ajaxHelpers.error(null, 'timeout', {abort: noop}, options);
        }, options.timeout);
    }

    return Vue.loadFile({
        url: options.url.replace(/\?(.+)=\?/, '?$1=' + callbackName),
        success: callBack,
        error: callBack
    });
}

/**
 *
 * override
 *
 * @param url
 * @param data
 * @param success
 * @param dataType
 * @returns {{XMLHttpRequest}}
 * @private
 */
function _paramParser(url, data, success, dataType) {

    if ('function' === type(data)) {

        dataType = success;
        success = data;
        data = undefined;

    }

    if ('function' !== type(success)) {

        dataType = success;
        success = undefined;

    }


    return {
        url: url,
        data: data,
        success: success,
        dataType: dataType
    }

}

var _loadFileDefaultSetting = {
    url: '',
    success: noop,
    error: noop,
    props: {}
};
var IS_CSS_RE = /\.css(?:\?|$)/i;

/**
 *
 *
 *
 * @param argsLength
 * @param arguments
 * @private
 */
function _loadFileArgsParser(length, args) {

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
        1: function (args) {

            if ('object' === type(args[0])) {
                return args[0];
            }

            return {
                url: args[0]
            }
        },

        // url success || url props
        2: function (args) {

            var _type = type(args[1]);
            var result = {
                url: args[0]
            };

            if ('function' === _type) {
                result.success = args[1];
            } else {
                result.props = args[1];
            }

            return result;
        },

        // url success error || url success props
        3: function (args) {

            var _type = type(args[2]);
            var result = {
                url: args[0],
                success: args[1]
            };


            if ('function' === _type) {
                result.error = args[2];
            } else {
                result.props = args[2];
            }

            return result;
        },

        // url success error props
        4: function (args) {
            return {
                url: args[0],
                success: args[1],
                error: args[2],
                props: args[3]
            }
        }
    }

    return [argsMapping[length](args)];
}

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
function loadFile(filelist) {

    if ('array' !== type(filelist)) {
        filelist = _loadFileArgsParser(arguments.length, arguments);
    }

    forEach(filelist, function (item, key) {

        var temp = _mergeExceptUndefined(
            _loadFileDefaultSetting
            , item
        );

        _loadFile(temp.url, temp.success, temp.error, temp.props);

    });

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
function _loadFile(url, success, error, props) {

    var isCss = IS_CSS_RE.test(url);
    var nodeName = 'SCRIPT';
    var defaultProps = {
        type: 'text/javascript',
        async: true,
        src: url
    };

    var header = document.head;

    if (isCss) {
        nodeName = 'LINK';
        defaultProps = {
            rel: 'stylesheet',
            href: url
        }
    }

    var node = document.createElement(nodeName);

    // 合二为一
    node.onload = node.onerror = function (event) {
        (event.type === 'load') ? success(event) : error(event);
        _clean(node);
        node = null;
    };

    extend(
        node,
        extend(props, defaultProps)
    );

    header.insertBefore(node, header.firstChild);

    function _clean(node) {
        node.onload = node.onerror = null;

        // Css 文件在文档中被移除后，样式会更随丢失
        if (isCss) {
            return;
        }

        for (var p in node) {
            delete node[p];
        }

        header.removeChild(node);
    }

}

/**
 * Serialize data to string.
 *
 * @param options
 */
function serializeData(options) {

    if (options.data && type(options.data) !== 'string') {
        options.data = Vue.util.param(options.data);
    }

    if (options.data && options.type.toLocaleLowerCase() === 'get') {
        options.url = appendQuery(options.url, options.data);
        options.data = undefined;
    }

}

/**
 * url后附加query string
 *
 * @param url
 * @param query
 * @returns {string}
 */
function appendQuery(url, query) {
    return (query === '') ? url : (url + '&' + query).replace(/[&?]{1,2}/, '?');
}

// install it.
install(Vue);