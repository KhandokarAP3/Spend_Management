import {Component, HostBinding} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {ToastrService} from 'ngx-toastr';
declare const _spPageContextInfo;
declare const CometChatWidget;

@Component({
  selector: 'app-chat',
  templateUrl: './comet-chat.component.html'
})
export class CometChatComponent {
  @HostBinding() class = 'chat-container';
  public showChat = false;

  constructor(private http: HttpClient, private toaster: ToastrService) {
    this.initializeChat();
  }

  initializeChat() {
    window.addEventListener('DOMContentLoaded', (event) => {
      CometChatWidget.init({
        appID: environment.cometChat.appID,
        appRegion: environment.cometChat.appRegion,
        authKey: environment.cometChat.authKey
      }).then(response => {
        const uid = _spPageContextInfo.userId + '';
        console.log('Initialization completed successfully');
        // You can now call login function.
        this.getUnreadMessages(uid);
        this.loginIntoCometChat(uid);
      }, error => {
        console.log('Initialization failed with error:', error);
        // Check the reason for error and take appropriate action.
      });
    });
  }

  getUnreadMessages(userId) {
    let headers = new HttpHeaders();
    headers = headers.set('apiKey', environment.cometChat.apiKey);
    headers = headers.set('onBehalfOf', userId);
    const httpOptions = {
      headers
    };
    this.http.get(`https://${environment.cometChat.appID}.api-${environment.cometChat.appRegion}.cometchat.io/v3.0/messages?unread=1&count=1`, httpOptions).subscribe((res: any) => {
      console.log('unread messages response', res);
      if (res.data.length > 0) {
        this.toaster.show('You have unread chat messages.');
        this.showChat = true;
      }
    }, err => {
      console.log(err);
    });
  }

  toggleChat() {
    this.showChat = !this.showChat;
  }

  private launchCometChat() {
    CometChatWidget.launch({
      widgetID: environment.cometChat.widgetID,
      target: '#cometchat',
      roundedCorners: 'true',
      height: '600px',
      width: '800px',
      // defaultID: 'superhero1', // default UID (user) or GUID (group) to show,
      defaultType: 'user' // user or group
    });
  }

  private loginIntoCometChat(uid) {
    CometChatWidget.login({
      uid
    }).then(res => {
      console.log(res);
      this.launchCometChat();
    }, error => {
      console.log('User login failed with error:', error);
      if (error.code === 'ERR_UID_NOT_FOUND') {
        this.createCometChatUser(uid);
      }
    });
  }

  private createCometChatUser(uid) {
    const user = new CometChatWidget.CometChat.User(uid);
    user.setName(_spPageContextInfo.userDisplayName);
    // user.setAvatar(AVATAR_URL);
    // user.setLink(PROFILE_LINK);
    user.setMetadata(`{"@private":{"email":"${_spPageContextInfo.userEmail}"}}`);
    CometChatWidget.createOrUpdateUser(user).then((newUser) => {
      console.log({newUser});
      setTimeout(() => {
        this.loginIntoCometChat(uid);
      }, 2000);
    }, error => {
      console.log({error});
    });
  }
}
