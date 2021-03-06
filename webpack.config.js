/**
 * @file
 * @fileoverview
 * @authors      zhangtao23
 * @date         2015/9/16
 * @version      1.0.0
 * @note
 */

/* global module */
/* global __dirname */

module.exports = {
    entry: './src/main.js',
    output: {
        path: './dist/',
        libraryTarget: 'umd',
        filename: 'vue-plugin.js'
    },
    resolve: {
        extensions: ['', '.js', '.es6']
    }
};