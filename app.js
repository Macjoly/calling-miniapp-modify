import { genTestUserSig } from './debug/GenerateTestUserSig'
import TSignaling from './components/TUICalling/TRTCCalling/node_module/tsignaling-wx'
import TSignalingClient from './components/TUICalling/TRTCCalling/TSignalingClient'
import TIM from './components/TUICalling/TRTCCalling/node_module/tim-wx-sdk'

const Signature = genTestUserSig('')
const TAG_NAME = 'app';
App({
  onLaunch: function() {
    wx.$globalData = {
      userInfo: null,
      headerHeight: 0,
      statusBarHeight: 0,
      sdkAppID: Signature.sdkAppID,
      userID: '',
      userSig: '',
      token: '',
      expiresIn: '',
      phone: '',
      sessionID: '',
    }
    wx.$TIM = TIM.create({SDKAppID: Signature.sdkAppID})
    wx.$TSignaling = new TSignaling({SDKAppID: Signature.sdkAppID, tim: wx.$TIM})
    wx.TSignalingClient = new TSignalingClient({ TSignaling: wx.$TSignaling })
      // 新的邀请回调事件
      wx.$TSignaling.on(TSignaling.EVENT.NEW_INVITATION_RECEIVED, this.handleNewInvitationReceived, this);
      // SDK Ready 回调
      wx.$TSignaling.on(TSignaling.EVENT.SDK_READY, this.handleSDKReady, this);
      // 被踢下线
      wx.$TSignaling.on(TSignaling.EVENT.KICKED_OUT, this.handleKickedOut, this);

  },
  handleNewInvitationReceived(event) {
    console.log(TAG_NAME, 'onNewInvitationReceived', event);
  },
  handleSDKReady() {
    console.log(TAG_NAME, 'sdk is ready')
  },
  handleKickedOut() {
    wx.showToast({
      title: '您被踢下线',
      icon: 'error',
    })
    wx.navigateTo({
      url: './pages/login/login',
    })
  },
  onShow() {
    wx.setKeepScreenOn({
      keepScreenOn: true,
    })
  },
    // TODO:
    resetLoginData() {
      this.globalData.expiresIn = ''
      this.globalData.sessionID = ''
      this.globalData.userInfo = {
        userID: '',
        userSig: '',
        token: '',
        phone: '',
      }
      this.globalData.userProfile = null
      logger.log(`| app |  resetLoginData | globalData: ${this.globalData}`)
    },
 
})
