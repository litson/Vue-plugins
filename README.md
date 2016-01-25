#Vue plugins

## NOTE:

2016-01-25 修复了Vue 1.0.13 中冻结util属性导致功能不可用的问题。
            Vuep 曝露方法从 Vue.util中迁移到 Vue.plugin 中




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
