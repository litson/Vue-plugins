#Vue plugins

## NOTE:
注意！目前仅支持1.0.7及以下版本。改造中

TODO:
    1、迁到webpack后并没有对代码做系拆分，需要重新拆分；
    2、定制化


### API
- Vue.$
- Vue.ajax
- Vue.ajaxSetting
- Vue.get
- Vue.getJSON
- Vue.post
- Vue.loadFile
- Vue.ready
- Vue.util.each
- Vue.util.noop
- Vue.util.param
- Vue.util.type 


#### Vue.ajax
```js
  
  // 同jQuery
  
  Vue.ajax(
    {
      type: 'post',
      data: {
        username: 'Kobe'
      },
      success: function( ajaxData ) { console.log( 'Do some staff...' ) },
      error  : function() { console.log( arguments ) }
    }
  )

```





### bower
`bower install vuep`
