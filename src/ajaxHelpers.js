module.exports = {
    error     : function ( error, type, xhr, options ) {
        var context = options.context;
        options.error.call( context, xhr, type, error );
    },
    success   : function ( data, xhr, options ) {
        var context = options.context;
        options.success.call( context, data, 'success', xhr );
    },
    beforeSend: function ( xhr, options ) {
        var context = options.context;
        if ( options.beforeSend.call( context, xhr, options ) === false ) {
            return false;
        }
    }
};