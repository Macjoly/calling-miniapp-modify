import { genTestUserSig } from '../../debug/GenerateTestUserSig'
const TAG_NAME = 'login';

Page({
  data: {
    userID: '',
  },

  onLoad: function() {

  },

  onShow: function() {

  },

  onBack: function() {
    wx.navigateBack({
      delta: 1,
    })
  },


  bindInputUserID(e) {
    this.setData({
      userID: e.detail.value,
    })
  },

  login() {
    if (!this.data.userID) {
      wx.showToast({
        title: '名称不能为空',
        icon: 'error',
      })
    } else {
      wx.$globalData.userID = this.data.userID
      wx.$globalData.userSig = genTestUserSig(this.data.userID).userSig
       wx.$TSignaling.login({
        userID: wx.$globalData.userID,
        userSig: wx.$globalData.userSig
      }).then((res) => {
        console.log(TAG_NAME, 'userSig login success', res);
        wx.switchTab({
          url: '../index/index',
        })
      });
    }
  },
})
