// detail.js

var config = require('../../config');
var util = require('../../utils/util.js');
var WxParse = require('../../plugin/wxParse/wxParse.js');

Page({
  data: {
    title: 'Photo',
    photo: {},
    comments: [],
    tags: [],
    id: 0,
    height: 0,
    pages: [],
    localImg: false,
    hideInfo: true,
    hideCamera: true,
    hideLens: true,
    hideAperture: true,
    hideISO: true,
    hideRate: true,
    hideVote: true,
    hideView: true
  },
  showPhotoInfo: function(e) {
    // this.setData({
    //   hideInfo: false
    // })
    console.log(this.data.photo.images[0].https_url);
    wx.previewImage({
      // current: '', // 当前显示图片的http链接
      urls: [this.data.photo.images[0].https_url] // 需要预览的图片http链接列表
    })
  },
  closeInfo: function(e) {
    this.setData({
      hideInfo: true
    })
  },
  loadUser: function(event) {
    var id = event.currentTarget.id,
      url = '../user/user?id=' + id;
    wx.navigateTo({
      url: url
    })
  },
  fetchDetail: function(id) {
    var that = this;
    console.log(id);
    util.showBusy('加载中');
    this.setData({
      localImg: false,
    })
    wx.request({
      url: `${config.service.BasicUrl}${config.service.photos}/${id}`,
      data: {
        image_size: 4,
        tags: '1',
        // comments: 1,
        consumer_key: config.service.CKEY
      },
      success: function(res) {
        var photo = res.data.photo;
        // var pages = getXML(res.data.photo.description);
        that.setData({
          photo: photo,
          height: photo.height * 750 / photo.width,
          // pages: util.getXML(photo.description),
          hideCamera: util.isNone(photo.camera),
          hideLens: util.isNone(photo.lens),
          hideAperture: util.isNone(photo.aperture),
          hideISO: util.isNone(photo.iso),
          hideRate: util.isNone(photo.rating),
          hideVote: util.isNone(photo.votes_count),
          hideView: util.isNone(photo.times_viewed),
          tags: photo.tags
        });
        var description = photo.description
        WxParse.wxParse('description', 'html', description,that, 5)
      },
      complete: function () {
        that.setData({
          localImg: true
        })
        util.showSuccess('加载完成');
      }
    });
    that.fetchReplies(id);
  },
  fetchReplies: function(id) {
    var that = this;
    wx.request({
      url: `${config.service.BasicUrl}${config.service.photos}/${id}/${config.service.comments}`,
      data: {
        consumer_key: config.service.CKEY
      },
      success: function(res) {
        that.setData({
          comments: res.data.comments
        })
      }
    })
  },
  onLoad: function(options) {
    console.log('load photo detail');
    this.fetchDetail(options.id);
  }
})
