// explore.js

var config = require('../../config');
var util = require('../../utils/util.js');

var WARP_SECOND = 1000 * 60;
var CACHED_TIME = WARP_SECOND * 2; // sec

Page({
  data: {
    range: '',
    imgUrls: [
      '../../images/swiper01.jpg',
      '../../images/swiper02.jpg',
      '../../images/swiper03.jpg'
    ],
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    windowHeight: 0,
    title: 'Explore',
    photos: [],
    feature: 'popular',
    request: true,
    hasMore: true,
    equalOne: false,
    rpp: 20,
    featureOptionHidden: true,
    featuresOptions: ['popular', 'fresh_today', 'fresh_week'],
    current_page: 1,
    initShow: false,
  },
  lookPhoto: function(event) {
    var id = event.currentTarget.id,
      url = '../detail/detail?id=' + id;
    wx.navigateTo({
      url: url
    })
  },
  showFeatureOptions: function(e) {
    // this.setData({
    //   featureOptionHidden: !this.data.featureOptionHidden
    // })
    let that = this;
    wx.showActionSheet({
      itemList: ['流行', '今天', '这周'],
      success: function (res) {
        that.chooseFeature(res.tapIndex);
      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    })
  },
  backTop: function () {
    this.setData({
      range: 'top'
    })
  },
  chooseFeature:function(e){
    if (this.data.featuresOptions[e] === this.data.feture) {
      return;
    } else {
      this.setData({
        current_page: 1
      });
    }
    this.setData({
      feature: this.data.featuresOptions[e],
      photos: [],
      rpp: 20
    });
    this.initData(this.data.feature);
  },
  initData: function(f){
    var cachedPhotos = wx.getStorageSync(f);
    if (!cachedPhotos) {
      this.fetchData();
    } else {
      var nowTs = Date.now();
      var oldTs = parseInt(wx.getStorageSync('requestTs') || 0);

      if (nowTs - oldTs > CACHED_TIME || !oldTs) {
        this.setData({
          photos: []
        })
        wx.setStorageSync(this.data.feature, []);
        wx.setStorageSync(this.data.feature + 'page', 1);
        this.fetchData();
      } else {
        this.setData({
          photos: cachedPhotos
        })
      }
    }
  },
  loadMore: function(e) {
    console.log('down');
    if (this.data.hasMore) {
      let page = wx.getStorageSync(this.data.feature + 'page') || 1
      this.setData({
        current_page: page + 1,
        initShow: true
      })
      this.fetchData();
    }

  },
  fetchData: function() {
    let that = this;

    let theRPP = that.data.rpp;
    util.showBusy('加载中');
    let current_page = this.data.current_page;
    if (this.data.request) {
      this.setData({
        request: false
      })
      wx.request({
        url: `${config.service.BasicUrl}${config.service.photos}`,
        data: {
          feature: this.data.feature,
          consumer_key: config.service.CKEY,
          page: current_page,
          sort: 'votes_count',
          sort_direction: 'desc',
          image_size: '3',
          include_store: 'store_download',
          include_states: 'voted',
          rpp: theRPP
        },
        success: function (res) {
          var fetchedData = res.data.photos;
          var newData = that.data.photos;
          newData.push.apply(newData, fetchedData.slice(theRPP - 20, theRPP));

          wx.setStorageSync(that.data.feature, newData);
          wx.setStorageSync(that.data.feature + 'page', current_page);
          wx.setStorageSync('requestTs', Date.now());

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
            initShow: false,
            rpp: newRPP
          })
          util.showSuccess('获取成功');
        },
        complete: function () {
          that.setData({
            request: true
          })
        }
      })
    }
  },
  onLoad: function () {
    console.log('load explore');
    this.initData(this.data.feature);
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
