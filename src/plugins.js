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

        Vue.util.each(elements, function (item, index) {

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
            if (type(item) === 'function') {
                item = item();
            }

            result.push(
                encodeURIComponent(index) + '=' + encodeURIComponent(item)
            );

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
            url: window.location.toString(),
            data: '',
            dataType: 'json',
            cache: true,
            context: null,
            xhr: function () {
                return new window.XMLHttpRequest()
            },
            success: Vue.util.NOOP,
            error: Vue.util.NOOP
        };

        var hashIndex;
        var dataType;
        var xhr;

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

        // xhr 实例
        xhr = options.xhr();

        xhr['onreadystatechange'] = function () {

            if (xhr.readyState === 4) {
                xhr['onreadystatechange'] = Vue.util.NOOP;

                var result;

                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {

                    result = xhr.responseText;


                }


            }

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
     *      Args: url , callBack , props
     *      1. loadFile( '//cdn.domain.cn/js/main.js' , function(){ console.log('callBack') } , { id:'mainjs' });
     *
     *
     *      Args: load a file list.
     *      2. loadFile( [
     *
     *          {
     *              url      : '//cdn.domain.cn/js/main.js',
     *              callBack : function(){ console.log('callBack for url : //cdn.domain.cn/js/main.js ') },
     *              props    : {
     *                              id     : 'mainjs',
     *                              appkey : 'aJKckjkjdklaj2jJKssdIk'
     *                         }
     *          },
     *
     *          {
     *              url      : '//cdn.domain.cn/css/normalize.css',
     *              callBack : function(){ console.log('callBack for url : //cdn.domain.cn/js/main.js ') }
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
