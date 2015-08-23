/**
 * @file
 * @fileoverview Vue plugins
 * @authors      litson.zhang@gmail.com
 * @date         2015.08.18
 * @version      1.0
 * @note
 */

/* global Vue */
;
(function (Vue) {

    var extend = Vue.util.extend;

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
    function each(elements, callBack) {
        if (!elements) {
            return;
        }

        if (elements.forEach) {
            return elements.forEach(callBack);
        }

        for (var key in elements) {
            if (elements.hasOwnProperty(key) && callBack(elements[key], key, elements) === false) {
                break;
            }
        }

    }

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

        Vue.util.each(elements, function (item, key) {

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
        cache: false,

        async: true,
        username: null,
        password: null,

        context: null,
        timeout: 0,

        xhr: function () {
            return new window.XMLHttpRequest()
        },

        beforeSend: noop,
        complete: noop,
        success: noop,
        error: noop
    };

    /**
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

        var blankRE = /^\s*$/;

        _mergeExceptUndefined(Vue.ajaxSettings, options);

        // 过滤掉hash
        hashIndex = options.url.indexOf('#');

        if (hashIndex > -1) {
            options.url = options.url.slice(0, hashIndex);
        }

        // 将参数附件在url上
        serializeData(options);

        dataType = options.dataType;

        // TODO: Ajax.cache
        if (options.cache) {
            Vue.util.log('暂不支持绕过缓存噢~');
        }

        // 不走 xhr + eval 的加载脚本方式，改为外联。保证没有跨域问题,而且性能上成
        if ('script' === dataType) {
            return Vue.util.loadFile(options.url, function () {
                _ajaxHelpers.success(null, null, options);
            }, function (event) {
                _ajaxHelpers.error(event, 'error', null, options);
            });
        }

        // xhr 实例
        xhr = options.xhr();

        xhr['onreadystatechange'] = function () {

            if (xhr.readyState === 4) {
                xhr['onreadystatechange'] = noop;

                var result;
                var error = false;

                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {

                    result = xhr.responseText;

                    if ('json' === dataType) {

                        try {
                            result = blankRE.test(result) ? null : JSON.parse(result + '');
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

        }

        // open
        xhr.open(options.type, options.url, options.async, options.username, options.password);

        // TODO: Ajax.timeout
        if (options.timeout) {
            Vue.util.log('暂不支持超时噢~');
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
        }
    }

    function _mergeExceptUndefined(from, to) {
        Vue.util.each(from, function (item, key) {

            if (to[key] === undefined) {
                to[key] = item;
            }

        });
    }

    /**
     *
     *
     * Ajax, method 'get'.
     *
     * Vue.get( url [, data ] [, success(data, textStatus, jqXHR) ] [, dataType ] )
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
     * Vue.post( url [, data ] [, success(data, textStatus, jqXHR) ] [, dataType ] )
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

    /**
     * Do nothing.
     */
    function noop() {
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

        var dataType = type(filelist);

        if ('array' !== dataType) {

        }

        Vue.util.each(filelist, function (item, key) {

            _mergeExceptUndefined(
                _loadFileDefaultSetting
                , item
            );

            var temp = filelist[key];

            _loadFile(temp.url, temp.success, temp.error, temp.props);

        });

    }

    /**
     * TODO: CSS support.
     *
     * @param url
     * @param success
     * @param error
     * @param props
     * @private
     */
    function _loadFile(url, success, error, props) {

        var node = document.createElement('SCRIPT');
        var header = document.head;

        node.onload = function () {
            success();
            _clean(node);
            node = null;
        };

        node.onerror = function () {
            error(event);
            _clean(node);
            node = null;
        }

        props = extend(props, {
            async: true,
            type: 'text/javascript',
            src: url
        });

        Vue.util.each(props, function (item, key) {
            node[key] = item;
        });

        header.insertBefore(node, header.firstChild);

        function _clean(node) {
            node.onload = node.onerror = node.onreadystatechange = null;
            for (var p in node) {
                delete node[p];
            }
            header.removeChild(node);
        }

    }

    /**
     * Get data type
     * @param object
     * @returns {string}
     */
    function type(object) {
        return Object.prototype.toString.call(object).replace(/\[\object|\]|\s/gi, '').toLowerCase();
    }

    // ==================== helpers ====================

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

    // ==================== Bound to global Vue ==================== //

    function install(Vue) {

        extend(Vue.util, {

            each: each,
            param: param,
            type: type,
            NOOP: noop

        });

        Vue.ajax = ajax;
        Vue.get = ajaxGet;
        Vue.post = ajaxPost;
        Vue.loadFile = loadFile;

        console.log('[ Vuejs plugins installation success! ]');
    }

    // install it.
    install(Vue);

})(Vue);


