
### 说明
本demo是基于[腾讯云calling小程序](https://github.com/tencentyun/TRTCSDK/tree/master/Web/TRTCScenesDemo/trtc-calling-web)修改了相关逻辑来实现全局监听，在收到邀请信令后跳转到指定页面（该页面注册了TUICalling组件）进行组件初始化，**使用前建议先了解官网demo的相关文档**，这里就不多做说明

### 全局监听效果展示
<img src="https://miller-1c285a-1253985742.tcloudbaseapp.com/2022git/0128.gif" style="widht: 45%;">

<img src="https://wangyg-4gsdbg0a58f646da-1253985742.tcloudbaseapp.com/images/012802.gif" style="widht: 45%;">

### 基于calling组件的修改说明
全局监听的实现思路就是在原有calling组件的基础上将信令放到了app.js文件，并在appLaunch实现邀请信令的监听，监听到邀请事件后处理邀请事件，并且把需要的参数设置为globalData方便取的时候获取，然后跳转页面初始化组件处理邀请事件，此外由于邀请没有走TRTCDelegate,所以挂断事件也是用信令单独处理的，由于时间比较催促，所以本demo仅提供思路和参考

#### 思维导图
<img src="https://miller-1c285a-1253985742.tcloudbaseapp.com/2022git/120803.png" style="widht: 45%;">

#### 修改点部分代码
1. app.js 引入信令相关文件
```
import TSignaling from './components/TUICalling/TRTCCalling/node_module/tsignaling-wx'
import TSignalingClient from './components/TUICalling/TRTCCalling/TSignalingClient'
import TIM from './components/TUICalling/TRTCCalling/node_module/tim-wx-sdk'
import { CALL_STATUS } from './components/TUICalling/TRTCCalling/common/constants'
```
2. 设置需要的全局参数
```
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
      _unHandledInviteeList: [],
      inviteData: null,
      inviteeList: []
```
3. 信令初始化和监听
```
    wx.$TIM = TIM.create({SDKAppID: Signature.sdkAppID})
    wx.$TSignaling = new TSignaling({SDKAppID: Signature.sdkAppID, tim: wx.$TIM})
    wx.TSignalingClient = new TSignalingClient({ TSignaling: wx.$TSignaling })
      // 新的邀请回调事件
      wx.$TSignaling.on(TSignaling.EVENT.NEW_INVITATION_RECEIVED, this.handleNewInvitationReceived, this);
      // SDK Ready 回调
      wx.$TSignaling.on(TSignaling.EVENT.SDK_READY, this.handleSDKReady, this);
      // 被踢下线
      wx.$TSignaling.on(TSignaling.EVENT.KICKED_OUT, this.handleKickedOut, this);
```
4. 邀请事件处理
```
 handleNewInvitationReceived(event) {
    console.log(TAG_NAME, 'onNewInvitationReceived', event);
    const { data: { inviter, inviteeList, data, inviteID, groupID } } = event
    const inviteData = JSON.parse(data)
    wx.$globalData.inviteData = inviteData
    wx.$globalData.inviteeList = inviteeList

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
    wx.$globalData.callStatus = CALL_STATUS.CALLING
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
      url: '/pages/calling/calling', // 需要跳转的页面
    })
    
  }
```
5. 跳转的页面引入 TUICalling 组件
```
    <TUICalling
    id="TUICalling-component"
    config="{{config}}"
  ></TUICalling>
```
6. 指定页面onLoad方法进行组件初始化和处理
```
   const config = {
      sdkAppID: wx.$globalData.sdkAppID,
      userID: wx.$globalData.userID,
      userSig: wx.$globalData.userSig
      }
      this.setData({
      config: { ...this.data.config, ...config },
      }, () => {
      this.TUICalling = this.selectComponent('#TUICalling-component')
      this.TUICalling.init()
      wx.$globalData.callStatus === CALL_STATUS.CALLING && this.TUICalling.handleNewInvitationReceived(wx.$globalData.callEvent)
      }) 
```
7. TUICalling.js 邀请事件处理
```
 // 新的邀请回调事件
    handleNewInvitationReceived(event) {
      console.log(`${TAG_NAME}, handleNewInvitationReceived`, event)
      this.data.config.type = wx.$globalData.callType
      this.getUserProfile([event.data.inviter || event.data.sponsor])
      this.setData({
        config: this.data.config,
        callStatus: 'calling',
        isSponsor: false,
      })
    }
```

8. 作为邀请方挂断处理
```
    /**
     * 当您作为被邀请方收到的回调时，可以调用该函数拒绝来电
     */
    async reject() {
      console.log(`${TAG_NAME}, reject`)
      const inviteID = wx.$globalData.inviteID
      const data = wx.$globalData.callEvent.data
      wx.$TSignaling.reject({
        inviteID,
        data: JSON.stringify(data)
      }).then(res => {
        this.triggerEvent('sendMessage', {
          message: res.data.message,
        })
      })
```



