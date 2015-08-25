/**
 * @file
 * @fileoverview DOM ready for Vue
 * @authors      litson.zhang@gmail.com
 * @date         2015.08.18
 * @version      1.0
 * @note
 */

/* global Vue */
;
(function (Vue, doc) {

    var isReady = false;
    var readyRE = /complete|loaded|interactive/;
    var eventType = 'DOMContentLoaded';

    var callBacks = [];

    if (readyRE.test(doc['readyState'])) {
        setTimeout(fireEvent, 1);
    } else {
        doc.addEventListener(eventType, fireEvent, false);
    }

    function fireEvent() {

        isReady = true;
        doc.removeEventListener(eventType, fireEvent, false);

        var fn;
        while (fn = callBacks.shift()) {
            fn(Vue);
        }
    }

    /**
     * Dom ready for Vue. bind to global Vue.
     *
     * E.g.
     *
     *      Vue.ready( function( Vue ) { console.log('Ready!',Vue); } );
     *
     * @param fn
     */
    Vue.ready = function (fn) {

        if (isReady) {
            fn(Vue);
        } else {
            callBacks.push(fn);
        }

    };

})(Vue, window.document);

