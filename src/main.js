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

/* global module,Vue */
// ==================== Bound to global Vue ==================== //
'use strict';

var install = {
    install: function ( Vue ) {

        /**
         * 如下配置可以跟进配置酌情注释，不会影响主功能；
         *
         * 一些变种函数如果注释掉打包后，可以更好的减少体积
         *
         * @type {{}}
         */

        Vue.plugin = Vue.plugin || {};

        Vue.plugin.each  = require( './each' );
        Vue.plugin.type  = require( './type' );
        Vue.plugin.NOOP  = require( './noop' );
        Vue.plugin.param = require( './param' );

        Vue.ready = require( './domReady' );

        Vue.ajaxSettings = require( './ajax' ).ajaxSettings;
        Vue.ajax         = require( './ajax' ).ajax;

        // 变种函数
        // Vue.get      = require( './ajaxGet' );
        // Vue.post     = require( './ajaxPost' );
        // Vue.getJSON  = require( './ajaxGetJSON' );
        Vue.loadFile = require( './loadFile' );

        Vue.$ = require( './Vue.$' );
    }
};

if ( window.Vue ) {
    Vue.use( install );
} else {
    module.exports = install;
}