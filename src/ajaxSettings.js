var noop       = require( './noop' );

module.exports = {
    type       : 'GET',
    url        : location.href,
    data       : '',
    dataType   : 'json',
    cache      : true,
    async      : true,
    username   : null,
    password   : null,
    contentType: null,
    xhrFields  : null,
    context    : null,
    timeout    : 0,
    xhr        : function () {
        return new window.XMLHttpRequest()
    },
    // 9��15�ո��£�����dataFilter
    dataFilter : null,
    beforeSend : noop,
    complete   : noop,
    success    : noop,
    error      : noop
};