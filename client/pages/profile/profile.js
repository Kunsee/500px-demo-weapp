
var util = require('../../utils/util.js');
var config = require('../../config');

var WARP_SECOND = 1000 * 60;
var CACHED_TIME = WARP_SECOND * 2; // sec

Page({
  data: {
    range: '',
    selectKey: 'old_User',
    initShow: false,
    windowHeight: 0,
    title: 'User',
    hasMore: 'true',
    username: '',
    fullname: '',
    users: [],
    term: '',
    id: '',
    current_page: 1,
    total_pages: 0,
    initShow: false
  },
  loadUser: function(event) {
    console.log(event.currentTarget.id);
    var id = event.currentTarget.id,
      url = '../user/user?id=' + id;
    wx.navigateTo({
      url: url
    })
  },
  search: function(e) {
    console.log(e);
    if (e.detail.value === '') {
      util.showWarn('请输入关键词');
      return
    }
    if (e.detail.value === wx.getStorageSync(this.data.selectKey)) {
      return
    } else {
      this.setData({
        users: [],
        initShow: true,
        term: e.detail.value,
        current_page: 1,
        hasMore: true,
        total_pages: 0
      })
    }
    this.initData()
  },
  loadMore: function (e) {
    console.log('down');
    this.setData({
      initShow: true,
    });
    if (this.data.hasMore) {
      this.setData({
        current_page: 1 + this.data.current_page
      })
      this.initData();
    }
  },
  initData: function(){
    var that = this;
    var current_page = this.data.current_page;
    this.setData({
      initShow: true
    })
    util.showBusy('加载中');
    wx.request({
      url: config.service.showUser,
      data: {
        term: that.data.term,
        page: current_page,
        consumer_key: config.service.CKEY
      },
      success: function(res) {
        var result = that.data.users;
        console.log(that.data.term, wx.getStorageSync(that.data.selectKey));
        if (that.data.term === wx.getStorageSync(that.data.selectKey)) {
          let len = res.data.users.length;
          for (let i = 0; i < len; i++) {
            result.push(res.data.users[i]);
          }
        } else {
          result = res.data.users
        }
        wx.setStorageSync(that.data.selectKey, that.data.term)
        that.setData({
          users: result,
          total_pages: res.data.total_pages
        })
        if (current_page >= res.data.total_pages) {
          that.setData({
            hasMore: false,
          })
        }
        util.showSuccess('获取成功');
      },
      fail: function () {
        util.showModel('未知错误', '加载失败');
      },
      complete: function () {
      }
    })
  },
  backTop: function () {
    this.setData({
      range: 'top'
    })
  },
  onLoad: function(options) {
    wx.removeStorageSync(this.data.selectKey);
  //
  },

  onReady: function () {
    try {
      var self = this;
      var query = wx.createSelectorQuery()
      query.select('.container').boundingClientRect()
      query.exec(function (res) {
        console.log(res[0].height);
        self.setData({ windowHeight: res[0].height + 'px' })
      })
    } catch (e) {

    }
  }
})