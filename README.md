# JSON ON

JSON 格式化工具

使用第三方格式化工具总觉得不太顺手，不是样式不喜欢就是功能不喜欢，所以决定自己动手改造一个轮子

项目原地址：https://github.com/bimohxh/jsonon，感谢原作者

本项目仅作为个人使用，并非商业项目，欢迎修改

![](https://raw.githubusercontent.com/bimohxh/jsonon/master/img/logo.png)

## 修改
- 在原来保存功能基础上，增加自动保存功能，浏览器会缓存你最后输入的内容
- 对非标准格式JSON尝试替换，假设我们期待结果`{"key": "value"}`，以下情况会被自动替换为正确格式的JSON
    * 单双引号包裹的JSON，类似于`'{"key": "value"}'`



## License
[Apache License 2.0](http://choosealicense.online/licenses/apache-2.0/)
