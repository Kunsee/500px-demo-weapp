// search.js

var util = require('../../utils/util.js');
var config = require('../../config');

var WARP_SECOND = 1000 * 60;
var CACHED_TIME = WARP_SECOND * 2; // sec

Page({
  data: {
    range: '',
    selectKey: 'oldKey',
    windowHeight: 0,
    title: 'Search',
    photos: [],
    term: '',
    loading: false,
    hasMore: true,
    equalOne: false,
    newSearch: false,
    initShow: false,
    rpp: 20,
    current_page: 1,
    total_pages: 0,
  },
  lookPhoto: function(e) {
    var id = e.currentTarget.id,
      url = '../detail/detail?id=' + id;
    wx.navigateTo({
      url: url
    })
  },

  search: function (e) {
    if (e.detail.value === '') {
      util.showWarn('请输入关键词');
      return 
    }  
    if (e.detail.value === wx.getStorageSync(this.data.selectKey)) {
      return
    } else {
      this.setData({
        photos: [],
        initShow: true,
        term: e.detail.value,
        current_page: 1,
        hasMore: true,
        total_pages: 0
      })
    }
    this.fetchData();
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
      this.fetchData();
    }
  },
  fetchData: function() {
    var that = this;
    var current_page = this.data.current_page;
    wx.request({
      url: config.service.search,
      data: {
        term: this.data.term,
        page: current_page,
        consumer_key: config.service.CKEY,
        image_size: '3',
        rpp: 20
      },
      success: function(res) {
        var result = that.data.photos;
        if (that.data.term === wx.getStorageSync(that.data.selectKey)) {
          let len = res.data.photos.length;
          for (let i = 0; i < len; i++) {
            result.push(res.data.photos[i]);
          }
        } else {
          result = res.data.photos
        }
        wx.setStorageSync(that.data.selectKey, that.data.term)
        that.setData({
          photos: result,
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
  onLoad: function () {
    console.log('load search');
    wx.removeStorageSync(this.data.selectKey);
    // this.initData(this.data.term);
  },

  onReady: function () {
    try {
      var self = this;
      var query = wx.createSelectorQuery()
      query.select('.container').boundingClientRect()
      query.exec(function (res) {
        self.setData({ windowHeight: res[0].height + 'px' })
      })
    } catch (e) {

    }
  }
})
