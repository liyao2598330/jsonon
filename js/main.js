'use strict';

(function () {
  Vue.component('vue-item', {
    props: ['jsondata', 'theme'],
    template: '#item-template'
  })

  Vue.component('vue-outer', {
    props: ['jsondata', 'isend', 'theme'],
    template: '#outer-template'
  })

  Vue.component('vue-expand', {
    props: [],
    template: '#expand-template'
  })

  Vue.component('vue-val', {
    props: ['field', 'val', 'isend', 'theme'],
    template: '#val-template'
  })

  Vue.use({
    install: function (Vue, options) {

      // 判断数据类型
      Vue.prototype.getTyp = function (val) {
        return toString.call(val).split(']')[0].split(' ')[1]
      }

      // 判断是否是对象或者数组，以对下级进行渲染
      Vue.prototype.isObjectArr = function (val) {
        return ['Object', 'Array'].indexOf(this.getTyp(val)) > -1
      }

      // 折叠
      Vue.prototype.fold = function ($event) {
        var target = Vue.prototype.expandTarget($event)
        target.siblings('svg').show()
        target.hide().parent().siblings('.expand-view').hide()
        target.parent().siblings('.fold-view').show()
      }
      // 展开
      Vue.prototype.expand = function ($event) {
        var target = Vue.prototype.expandTarget($event)
        target.siblings('svg').show()
        target.hide().parent().siblings('.expand-view').show()
        target.parent().siblings('.fold-view').hide()
      }

      //获取展开折叠的target
      Vue.prototype.expandTarget = function ($event) {
        switch($event.target.tagName.toLowerCase()) {
          case 'use':
            return $($event.target).parent()
          case 'label':
            return $($event.target).closest('.fold-view').siblings('.expand-wraper').find('.icon-square-plus').first()
          default:
            return $($event.target)
        }
      }

      // 格式化值
      Vue.prototype.formatVal = function (val) {
        switch(Vue.prototype.getTyp(val)) {
          case 'String':
            return '"' + val + '"'
            break

          case 'Null':
            return 'null'
            break

          default:
            return val

        }
      }

      // 判断值是否是链接
      Vue.prototype.isaLink = function (val) {
        return /^((https|http|ftp|rtsp|mms)?:\/\/)[^\s]+/.test(val)
      }

      // 计算对象的长度
      Vue.prototype.objLength = function (obj) {
        return Object.keys(obj).length
      }
    }
  })


  // 主题 [key, String, Number, Boolean, Null, link-link, link-hover]
  let themes = [
    ['#92278f', '#3ab54a', '#25aae2', '#f3934e', '#f34e5c', '#717171'],
    ['rgb(19, 158, 170)', '#cf9f19', '#ec4040', '#7cc500', 'rgb(211, 118, 126)', 'rgb(15, 189, 170)'],
    ['#886', '#25aae2', '#e60fc2', '#f43041', 'rgb(180, 83, 244)', 'rgb(148, 164, 13)'],
    ['rgb(97, 97, 102)', '#cf4c74', '#20a0d5', '#cd1bc4', '#c1b8b9', 'rgb(25, 8, 174)']
  ]
  var App = new Vue({
    el: '#app',
    data: {
      baseview: 'formater',
      view: 'code',
      jsoncon: undefined,
      newjsoncon: '{"name": "Json on"}',
      jsonhtml: undefined,
      compressStr: '',
      error: {},
      historys: [],
      history: {name: ''},
      isSaveShow: false,
      isExportTxtShow: false,
      exTxt: {
        name: 'JSONON'
      },
      themes: themes,
      checkedTheme: 0,
      isSharing: false
    },
    methods: {

      // 全部展开
      expandAll: function () {
        $('.icon-square-min').show()
        $('.icon-square-plus').hide()
        $('.expand-view').show()
        $('.fold-view').hide()
      },

      // 全部折叠
      collapseAll: function () {
        $('.icon-square-min').hide()
        $('.icon-square-plus').show()
        $('.expand-view').hide()
        $('.fold-view').show()
      },

      // 压缩
      compress: function () {
        App.jsoncon = Parse.compress(App.jsoncon)
      },

      // 清空
      clearAll: function () {
        App.jsoncon = ''
      },

      // 美化
      beauty: function () {
        let data = "";
        try{
          data = JSON.stringify(JSON5.parse(App.jsoncon), undefined, 4)
        }catch (json_error) {
          try{
            data = JSON.stringify(eval("("+App.jsoncon+")"),undefined, 4)
          }catch (eval_error) {
            throw json_error
          }
        }
        App.jsoncon = data
      },
      fix_json(){
        let data = this.jsoncon;
        if(data){
          // 替换单双引号包裹的情况 eg. '{"key": "value"}'
          data=data.replace(/^'{|^"{/i,"{").replace(/}'$|}"$/i,"}");
          // 如果所有引号都为单引号，则统一替换为双引号
          if(data.indexOf('"')===-1&&data.indexOf("'")!==-1){
            let len = data.match(/'/g);
            len = len ? len.length : 0;
            console.log(len)
            if(len>=2){
              data = data.replaceAll("'", '"');
            }
          }
          // 替换所有引号被转义的情况 eg. {\"key\": \"value\"}
          if(data.indexOf("\\'")&&data.indexOf('\\"')===-1){
            data = data.replaceAll("\\'", '"');
          }else if(data.indexOf('\\"')&&data.indexOf("\\'")===-1){
            data = data.replaceAll('\\"', '"')
          }
        }
        this.jsoncon = data
      },
      // 根据json内容变化格式化视图
      showJsonView: function () {
        this.fix_json();
        try {
          if (this.jsoncon.trim() === '') {
            App.view = 'empty'
          } else {
            App.view = 'code'
            App.jsonhtml = jsonlint.parse(this.jsoncon)
          }
        } catch (ex) {
          App.view = 'error'
          App.error = {
            msg: ex.message
          }
        }
      },

      // 保存当前的JSON
      save: function () {
        if (App.history.name.trim() === '') {
          Helper.alert('名称不能为空！', 'danger')
          return
        }
        var val = {
          name: App.history.name,
          data: App.jsoncon
        }
        var key = String(Date.now())
        localforage.setItem(key, val, function (err, value) {
          Helper.alert('保存成功！', 'success')
          App.isSaveShow = false
          val.key = key
          App.historys.push(val)
        })
      },

      auto_save(){
        localforage.setItem('auto_save', App.jsoncon)
      },

      // 删除已保存的
      remove: function (item, index) {
        localforage.removeItem(item.key, function () {
          App.historys.splice(index, 1)
        })
      },

      // 根据历史恢复数据
      restore: function (item) {
        localforage.getItem(item.key, function (err, value) {
          App.jsoncon = item.data
        })
      },

      // 获取所有保存的json
      listHistory: function () {
        localforage.iterate(function (value, key, iterationNumber) {
          if (key[0] !== '#'&&key !== 'auto_save') {
            value.key = key;
            App.historys.push(value)
          }
          if (key === '#theme') {
            // 设置默认主题
            App.checkedTheme = value
          }
        })
      },


      // 切换主题
      switchTheme: function (index) {
        this.checkedTheme = index
        localforage.setItem('#theme', index)
      },

    },
    watch: {
      jsoncon: function () {
        App.showJsonView()
        App.auto_save()
      }
    },
    computed: {
      theme: function () {
        let th = this.themes[this.checkedTheme]
        let result = {}
        let index = 0
        ;['key', 'String', 'Number', 'Boolean', 'Null', 'link-link'].forEach(key => {
          result[key] = th[index]
          index++
        })
        return result
      }
    },
    created () {
      this.listHistory()
      var clipboard = new Clipboard('.copy-btn')
    },
    mounted: function () {
      localforage.getItem('auto_save', function (err, value) {
        App.jsoncon = value
      })
    }

  })
})()
