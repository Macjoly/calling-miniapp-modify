import { genTestUserSig } from './debug/GenerateTestUserSig'
import TSignaling from './components/TUICalling/TRTCCalling/node_module/tsignaling-wx'
import TSignalingClient from './components/TUICalling/TRTCCalling/TSignalingClient'
import TIM from './components/TUICalling/TRTCCalling/node_module/tim-wx-sdk'
import { EVENT, CALL_STATUS, MODE_TYPE, CALL_TYPE } from './components/TUICalling/TRTCCalling/common/constants'

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
      callStatus: CALL_STATUS.IDLE, // 用户当前的通话状态
      callType: 1,
      callEvent: null,
      inviteId: '',
      inviteID: '',
      inviter: '',
      roomID: '',
      isSponsor: false,
      _connectUserIDList: [],
      _isGroupCall: false,
      _groupID: '',
      _unHandledInviteeList: []
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
    const { data: { inviter, inviteeList, data, inviteID, groupID } } = event
    const inviteData = JSON.parse(data)
    
    // 此处判断inviteeList.length 大于2，用于在非群组下多人通话判断
    // userIDs 为同步 native 在使用无 groupID 群聊时的判断依据
    const isGroupCall = groupID || inviteeList.length >= 2 || inviteData.data && inviteData.data.userIDs && inviteData.data.userIDs.length >= 2 ? true : false
    let callEnd = false
    // 此处逻辑用于通话结束时发出的invite信令
    // 群通话已结束时，room_id 不存在或者 call_end 为 0
    if (isGroupCall && (!inviteData.room_id || (inviteData.call_end && inviteData.call_end === 0))) {
      callEnd = true
    }
    // 1v1通话挂断时，通知对端的通话结束和通话时长
    if (!isGroupCall && inviteData.call_end >= 0) {
      callEnd = true
    }

    if(callEnd) {
      return
    }
    
    if(wx.$globalData.callStatus === CALL_STATUS.CALLING || wx.$globalData.callStatus === CALL_STATUS.CONNECTED) {
      wx.$TSignaling.reject({ inviteID, type: data.call_type, lineBusy: 'line_busy' })
      return
    }
    const callInfo = {
      _isGroupCall: !!isGroupCall,
      _groupID: groupID || '',
      _unHandledInviteeList: [...inviteeList, inviter],
    }
    if (isGroupCall && !groupID) {
      callInfo._unHandledInviteeList = [...inviteData.data.userIDs]
    }
    
    wx.$globalData.callType = inviteData.call_type
    wx.$globalData.inviteID = inviteID
    wx.$globalData.inviter= inviter
    wx.$globalData.roomID = inviteData.room_id
    wx.$globalData.isSponsor = false
    wx.$globalData._connectUserIDList = [inviter]
    wx.$globalData._isGroupCall = callInfo._isGroupCall
    wx.$globalData._groupID = callInfo._groupID
    wx.$globalData._unHandledInviteeList = callInfo._unHandledInviteeList
    
    wx.$globalData.callEvent = event
    wx.navigateTo({
      url: '/pages/calling/calling',
    })
    
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
