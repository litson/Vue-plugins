#Vue plugins

- Vue.ajax
- Vue.get
- Vue.post
- Vue.ready
- Vue.loadScript
- Vue.util.param
- Vue.util.each

- Vue.getJSON


#TODO

完全舍弃Zepto还是有些吃力，新增接口Vue.$，添加一些常用DOM操作.

```js

 // Vue.$
 // e.g
 Vue.$('.box').html('<p> hi </p>').show();
 
 // 实例属性
 var $box = Vue.$('.box');
 
 $box.show();
 $box.hide();
 
 $box.remove();
 
 $box.html();
 $box.text();
 
 $box.attr();
 
 $box.addClass();
 $box.removeClass();
 
 $box.offset();
 
 $box.height();
 $box.width();
 
 
 


```
 
