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
            context: null,
            xhr: function () {
                return new window.XMLHttpRequest()
            },
            success: Vue.util.NOOP,
            error: Vue.util.NOOP
        }

        options = extend(defaultOptions, options || {});


        console.log(options);

        serializeData(options);

        console.log(options);


    }


    Vue.util.each = each;
    Vue.util.param = param;
    Vue.ajax = Vue.util.ajax = ajax;
    Vue.util.NOOP = function () {
    };


    // ==================== helpers ====================


    /**
     * Serialize data to string.
     *
     * @param options
     */
    function serializeData(options) {

        if (type(options.data) !== 'string') {
            options.data = Vue.util.param(options);
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
