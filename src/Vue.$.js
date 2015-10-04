/**
 * @file
 * @fileoverview 简版的jQuery操作，不要妄想和jQuery一样。。
 *               实际上是对原有Vue.util提供的dom操作做了封装，并追加一些常用API
 *               因此，无法实现jquery中所有事务皆为jquery实例的实现，
 *               例如比较典型的一个问题，$(fn) == $(document).ready(fn) 中返回值问题，jq为递归操作，而vQuery只能调用Vue.ready，
 *               并返回实例原形。（因此我也是去掉了该重载方式的实现）
 *
 * @authors      zhangtao23
 * @date         2015/9/29
 * @version      1.0.0
 * @note
 */

/* global module */
/* global Vue */

'use strict';

// ==================== Bound to global Vue ==================== //

function install(Vue) {
    Vue.$ = vQuery;
    // 将Vue-plugin的API签名打包到vueExpose中，方便作者查看
    Vue.vueExpose = Vue.vueExpose || [];
    Vue.vueExpose.push('$');

    console.log('[ Vuejs < Vue $ module > installation success! ]');
}
// ==================== vQuery ==================== //

var doc = document;

var makeArray = function (arrayLike) {
    return Array.prototype.slice.call(arrayLike, 0);
};

var vQuery = function (selecter) {
    return new vQuery.fn.init(selecter);
};

/**
 * ========= API集合 #start =========
 *
 * 注意：这只是简化库，我在写的时候几乎放弃了所有异常检测，
 *      他肯定没有jquery 、Zepto那么健壮，但是我们需要的就是lite版本，
 *      做太多hack反而违背了初衷。
 */
var proto = {
    constructor: vQuery,
    init: function (selecter) {
        var self = this;

        if (!selecter) {
            return self;
        }

        var dom = makeArray(doc.querySelectorAll(selecter), 0);

        Vue.util.each(
            dom,
            function (item, index) {
                self[index] = item;
            }
        );

        self.length = dom.length;
        dom.__proto__ = vQuery.fn;
        return dom;

    },
    length: 0
};

Vue.util.extend(proto, {
    size: function () {
        return this.length;
    },

    addClass: function (value) {
        var length = this.length;
        while (length--) {
            Vue.util.addClass(this[length], value);
        }
        return this;
    },
    removeClass: function (value) {
        var length = this.length;
        while (length--) {
            Vue.util.removeClass(this[length], value);
        }
        return this;
    },

    remove: function () {
        var length = this.length;
        while (length--) {
            Vue.util.remove(this[length]);
        }
        return this;
    },

    // Vue不同版本处理不一样，早些版本是attr自动加Vue.config中的前缀，
    // 1.0版本后才去掉了前缀，所以干脆这里重新实现了。
    attr: function (name, value) {
        if (value == undefined) {
            return this[0].getAttribute(name);
        }
        var length = this.length;
        while (length--) {
            this[length].setAttribute(name, value);
        }
        return this;
    },
    removeAttr: function (name) {
        var length = this.length;
        while (length--) {
            this[length].removeAttribute(name);
        }
        return this;
    },

    // 警告：大量的innerHtml会报错，jq中有fallback，将其打成元素append，这里很松散的没有做处理
    //      数据量大时谨慎调用。
    //      实验结果是，innerHTML对行数有限制，大于某阙值将溢出。
    html: function (value) {
        if (value == undefined) {
            return this[0].innerHTML;
        }
        var length = this.length;
        while (length--) {
            this[length].innerHTML = value;
        }
        return this;
    },

    // show & hide 没有对之前的显示方式缓存，采用比较基础的切换display的方式。
    show: function () {
        return this.css('display', '');
    },
    hide: function () {
        return this.css('display', 'none');
    },

    // 警告：这里处理太多 jQuery.style api 的实现会很重，因此没有过多处理（其实是写了的，后来感觉违背本意，删除了大部分逻辑）
    //      所以希望开发者自我约束传入单位
    css: function (name, value) {

        var length = this.length;

        function parseUnit(number) {
            return typeof number === 'number' ? number + 'px' : number;
        }

        if (Vue.util.isPlainObject(name)) {

            var cssText = [''];
            Vue.util.each(name, function (item, key) {
                cssText.push(
                    key + ':' + parseUnit(item)
                )
            });
            cssText.push('');
            cssText = cssText.join(';');

            while (length--) {
                this[length].style.cssText += cssText;
            }

        } else {
            name = Vue.util.camelize(name);

            if (value == undefined) {
                return window.getComputedStyle(this[0], null)[name];
            } else {
                while (length--) {
                    this[length].style[name] = parseUnit(value);
                }
            }
        }

        return this;
    },

    // on & off，event这块单独拎出来都是大学问，纠结了很久，决定还是放弃jquery中维护event 存储对象的方式
    // 依然简陋的实现，稍微有点成绩的，就是批量绑定吧
    on: function (type, fn) {
        var length = this.length;
        while (length--) {
            Vue.util.on(this[length], type, fn);
        }
        return this;
    },
    off: function (type, fn) {
        var length = this.length;
        while (length--) {
            Vue.util.off(this[length], type, fn);
        }
        return this;
    }
});

// width & height;
// 没有特别对document、window等等做处理，一般情况下用不到
// 继续保持轻量
Vue.util.each(['width', 'height'], function (key) {

    proto[key] = function (value) {

        if (value) {
            return this.css(key, typeof value === 'string' ? value : value + 'px');
        }

        return this[0].getBoundingClientRect()[key];
    }

});

/* ========= API集合 #end ========= */

// 原形变换
vQuery.fn = vQuery.prototype = proto;
vQuery.fn.init.prototype = vQuery.fn;

// install
install(Vue);