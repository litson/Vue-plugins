/**
 * @file
 * @fileoverview each / type / noop
 * @authors      litson.zhang@gmail.com
 * @date         2015.08.18
 * @version      1.0.5
 * @note         ajax 模块单拎出来
 */

/* global Vue */

// ==================== Bound to global Vue ==================== //

function install(Vue) {

    Vue.util.each = each;
    Vue.util.type = type;
    Vue.util.NOOP = noop;

    console.log('[ Vuejs < plugins module > installation success! ]');
}

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
 * Do nothing.
 */
function noop() {
}

/**
 * Get data type
 * @param object
 * @returns {string}
 */
function type(object) {
    return Object.prototype.toString.call(object).replace(/\[\object|\]|\s/gi, '').toLowerCase();
}

// install it.
install(Vue);