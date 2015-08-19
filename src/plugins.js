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
     * @param elements
     * @param callBack
     */
    function each(elements, callBack) {

        if (elements.forEach) {
            return elements.forEach(callBack);
        }

        for (var key in elements) {
            callBack(elements[key], key, elements);
        }

    }

    /**
     * Serialize form elements
     *
     * @param elements
     * @returns {string}
     */
    function param(elements) {

        var result = [];
        var dataType;

        Vue.util.each(elements, function (item, key) {

            dataType = type(item);

            /*
             *
             * E.g:
             *
             * 支持函数表达式传值：
             *
             *      var i = 0;
             *
             *      Vue.util.param( { field: function (){ return ++i; } } );
             *      // output: field=1
             *
             */
            if ('function' === dataType) {
                item = item();
                dataType = type(item);
            }

            if (item == null) {
                item = '';
            }

            /**
             *
             * E.g:
             *
             * transform:
             *      {
             *          a: { a1:1 },
             *          b: [1, 3, 5]
             *      }
             *
             * to:
             *      a[a1]=1&b[]=1&b[]=3&b[]=5
             *
             */
            if ('object' === dataType || 'array' === dataType) {

                Vue.util.each(item, function (_item, _key) {

                    _key = [key, '[', _key, ']'].join('');

                    //result.push(
                    //    encodeURIComponent(_key) + '=' + encodeURIComponent(_item)
                    //);

                    result.push(
                        _key + '=' + _item
                    );

                });

            } else {

                //result.push(
                //    encodeURIComponent(key) + '=' + encodeURIComponent(item)
                //);

                result.push(
                    key + '=' + item
                );

            }

        });

        return result.join('&');

    }

    /**
     *
     *
     *
     * @version 1.0.0 lite版ajax接口
     *
     *
     *
     * @param options
     *
     * Defaults:
     *  { }
     *
     *      type: 'GET'
     *      url : location.toString()
     *      data: ''
     *      dataType: 'json'
     *      context : null
     *
     *
     *
     */
    function ajax(options) {

        var defaultOptions = {
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

            success: Vue.util.NOOP,
            error: Vue.util.NOOP

        };

        var hashIndex;
        var dataType;
        var xhr;

        var blankRE = /^\s*$/;

        options = extend(defaultOptions, options || {});

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
            Vue.util.warn('暂不支持绕过缓存噢~');
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
                xhr['onreadystatechange'] = Vue.util.NOOP;

                var result;
                var error = false;

                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {

                    result = xhr.responseText;

                    try {
                        result = blankRE.test(result) ? null : JSON.parse(result);
                    } catch (ex) {
                        error = ex;
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
            Vue.util.warn('暂不支持超时噢~');
        }

        xhr.send(options.data);

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


    /**
     * Do nothing.
     */
    function noop() {
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

    }


    // ==================== Bind to global Vue ==================== //

    Vue.util.each = each;
    Vue.util.param = param;
    Vue.util.NOOP = noop;
    Vue.util.loadFile = loadFile;

    Vue.ajax = Vue.util.ajax = ajax;

    // ==================== helpers ====================


    /**
     * Serialize data to string.
     *
     * @param options
     */
    function serializeData(options) {

        if (type(options.data) !== 'string') {
            options.data = Vue.util.param(options.data);
        }

        if (options.type.toLocaleLowerCase() === 'get') {
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

    /**
     * Get data type
     * @param object
     * @returns {string}
     */
    function type(object) {
        return Object.prototype.toString.call(object).replace(/\[\object|\]|\s/gi, '').toLowerCase();
    }


})(Vue);


