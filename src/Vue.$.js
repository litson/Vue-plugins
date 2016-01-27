/* global module */
/* global Vue */
// ==================== vQuery ==================== //

var doc  = document;
var each = require( './each' );

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