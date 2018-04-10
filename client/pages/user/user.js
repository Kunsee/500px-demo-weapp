// user.js

var config = require('../../config');
var util = require('../../utils/util.js');

var WARP_SECOND = 1000 * 60;
var CACHED_TIME = WARP_SECOND * 2; // sec

Page({
  data: {
    range: '',
    windowHeight: 0,
    title: 'User',
    user: {},
    photos: [],
    contacts: [],
    hasMore: true,
    equalOne: false,
    id: '',
    rpp: 20,
    hideCamera: true,
    hideLens: true,
    hideCity: true,
    initShow: false,
  },
  lookPhoto: function(e) {
    var id = e.currentTarget.id,
      url = '../detail/detail?id=' + id;
    wx.navigateTo({
      url: url
    })
  },
  loadMore: function(e) {
    console.log('down');
    if (this.data.hasMore) {
      this.fetchData(this.data.id);
    }
  },
  fetchUser: function(id) {
    var that = this;
    console.log(id);
    util.showBusy('加载中');
    wx.request({
      url: `${config.service.getUser}${id}`,
      data: {
        consumer_key: config.service.CKEY
      },
      success: function(res) {
        var user = res.data.user;
        var objC = user.contacts;
        var arrayC = [];
        for (var key in objC){
          arrayC.push([key, objC[key]]);
        }

        that.setData({
          id: id,
          user: user,
          hideCamera: util.isNone(user.camera),
          hideLens: util.isNone(user.lens),
          hideCity: util.isNone(user.city),
          contacts: arrayC
        });
        that.fetchData(id);
        util.showSuccess('加载完成');
      }
    });
  },
  initData: function(id){
    var cachedPhotos = wx.getStorageSync('userphotos');

    if (!cachedPhotos) {
      this.fetchData(id);
    } else {
      var nowTs = Date.now();
      var oldTs = parseInt(wx.getStorageSync('requestUserTs') || 0);

      if (nowTs - oldTs > CACHED_TIME || !oldTs) {
        this.fetchData(id);
      } else {
        this.setData({
          loading: false,
          photos: cachedPhotos
        })
      }
    }
  },
  fetchData: function(id) {
    var that = this;

    var theRPP = that.data.rpp;
    console.log(id);
    console.log(theRPP);
    util.showBusy('加载中');
    wx.request({
      url: `${config.service.BasicUrl}${config.service.photos}`,
      data: {
        feature: 'user',
        user_id: id,
        consumer_key: config.service.CKEY,
        sort: 'created_at',
        sort_direction: 'desc',
        image_size: '3',
        include_store: 'store_download',
        include_states: 'voted',
        rpp: theRPP
      },
      success: function(res) {
        var fetchedData = res.data.photos;

        var newData = that.data.photos;
        newData.push.apply(newData, fetchedData.slice(theRPP - 20, theRPP));

        wx.setStorageSync('userphotos', newData);
        wx.setStorageSync('requestUserTs', Date.now());

        var hasMore = true;
        var newRPP = theRPP + 20;
        var equalOne = false;
        if (fetchedData.length < theRPP) {
          hasMore = false;
          newRPP = fetchedData.length;
        } else if (that.equalOne) {
          hasMore = false;
          newRPP = fetchedData.length;
        } else {
          equalOne = true;
        }

        that.setData({
          photos: newData,
          hasMore: hasMore,
          equalOne: equalOne,
          rpp: newRPP
        })
        util.showSuccess('加载完成');
      }
    });
  },

  backTop: function () {
    this.setData({
      range: 'top'
    })
  },
  onLoad: function(options) {
    console.log('load user');
    this.fetchUser(options.id);
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
