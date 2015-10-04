#Vue plugins

Vue.js的插件系统，目的在于弃用jQuery 或 Zepto，有一定的落地实战基础。

主要由3部分组成 `ajax` 、 `$` 及 ___工具函数___，可使用`Vue.vueExpose` 访问组件API列表。

### Ajax
- Vue.ajax
- Vue.ajaxSetting
- Vue.get
- Vue.post
- Vue.getJSON

### $
依赖于Vue.util中自带API，将其封装为$包装集（jQuery & Zepto）
```html

  <div class='test-item' data-attr='1'></div>
  <div class='test-item' data-attr='2'></div>
  <div class='test-item' data-attr='3'></div>

```


```js

 var $tests = Vue.$('.test-item');
 
 $tests.html('test');
 
 $tests.attr('data-attr'); // output 1

 $tests.addClass('bg-red');
 
 $test.removeClass('test-item');
 
 // etc.

```

### 工具函数
- Vue.ready (dom ready)
- Vue.util.each
- Vue.util.NOOP
- Vue.util.param
- Vue.util.type