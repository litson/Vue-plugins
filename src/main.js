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

/* global module */
// ==================== Bound to global Vue ==================== //
'use strict';

Vue.use( {
    install: function ( Vue ) {

        Vue.plugin = Vue.plugin || {};

        Vue.plugin.each  = require( './each' );
        Vue.plugin.type  = require( './type' );
        Vue.plugin.NOOP  = require( './noop' );
        Vue.plugin.param = require( './param' );

        Vue.ready = require( './domReady' );

        Vue.util.extend(
            Vue,
            require( './ajax' )
        );

        Vue.$ = require( './Vue.$' );
    }
} );