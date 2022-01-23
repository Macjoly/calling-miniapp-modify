// pages/calling/calling.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        config: {
            sdkAppID: wx.$globalData.sdkAppID,
            userID: wx.$globalData.userID,
            userSig: wx.$globalData.userSig,
            type: wx.$globalData.callType,
            tim: wx.$TIM,
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const config = {
            sdkAppID: wx.$globalData.sdkAppID,
            userID: wx.$globalData.userID,
            userSig: wx.$globalData.userSig
          }
          this.setData({
            config: { ...this.data.config, ...config },
          }, () => {
            this.TUICalling = this.selectComponent('#TUICalling-component')
            console.log(2222, this.data.config)
            console.log(1111, this.TUICalling)
            this.TUICalling.init()
            this.TUICalling.handleNewInvitationReceived(wx.$globalData.callEvent)
          })   
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})