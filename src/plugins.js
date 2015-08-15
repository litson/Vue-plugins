(function () {

    var extend = Vue.util.extend;

    /**
     * ref: http://devdocs.io/javascript/global_objects/array/foreach
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
    function param(elements, excepts) {

        var result = [];

        Vue.util.each(elements, function (item, index) {

            /*
             *
             * 支持：
             *      var i = 0;
             *
             *      data: {
             *                 param1: function(){ return i++ }
             *            }
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

    function ajax(options) {

        var defaultOptions = {
            type: 'get',
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
     * 序列化数据
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
     * @param url
     * @param query
     * @returns {*}
     */
    function appendQuery(url, query) {
        return (query === '') ? url : (url + '&' + query).replace(/[&?]{1,2}/, '?');
    }

    /**
     * 获取数据类型
     * @param object
     * @returns {string}
     */
    function type(object) {
        return Object.prototype.toString.call(object).replace(/\[\object|\]|\s/gi, '').toLowerCase();
    }


})();
