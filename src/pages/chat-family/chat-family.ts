import { Component, ViewChild, NgZone, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavParams, ModalController, Events, Content, TextInput } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { MyApp } from '../../app/app.component';
import * as moment from 'moment';
import { interceptor } from '../../providers/auth-service/interceptor';
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/fromEvent';
import { WebSocketsProvider } from '../../providers/web-sockets/web-sockets';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { PreviewImageChatComponent } from '../../components/preview-image-chat/preview-image-chat';
import { ListChatsPage } from '../list-chats/list-chats';


@IonicPage()
@Component({
  selector: 'page-chat-family',
  templateUrl: 'chat-family.html',
})
export class ChatFamilyPage {

  @ViewChild(Content) content: Content;
  @ViewChild('chat_input') messageInput: TextInput;
  msgList: any;
  msgListObserver: Observable<Array<any>>;
  editorMsg = '';
  showEmojiPicker = false;
  public nameTeam: string = "";

  ramdon: number;

  private updateTimeMessage: any;

  public user: any;

  private static enableChat: boolean = false;
  public static eventChat: Function = (payload: any) => {
    if (ChatFamilyPage.enableChat === false) return;
    ChatFamilyPage.changeMessages(payload);
  }

  private static changeMessages: Function = function (payload) { console.log(payload) };


  constructor(navParams: NavParams, private events: Events,
    private http: HttpClient, private ngZone: NgZone,
    public changeDectRef: ChangeDetectorRef, private subscription: WebSocketsProvider,
    public helper: HelpersProvider, public modal: ModalController
  ) {
    this.ramdon = new Date().getTime();

    this.user = MyApp.User;

    let t = this;
    ChatFamilyPage.changeMessages = (payload) => {
      t.pushNewMsg(payload)
    };

    this.deleteNotificationLocal();
  }

  deleteNotificationLocal() {
    //Para quitar la notificacion local
    let index = ListChatsPage.newMessages.findIndex(function (id) { return id === "chatFamily"; });
    if (index !== -1) {
      if (ListChatsPage.newMessages.length === 1) {
        ListChatsPage.newMessages = [];
      } else {
        ListChatsPage.newMessages.splice(index, 1);
      }
      MyApp.counts["chat"] = ListChatsPage.newMessages.length
    }

    if (ListChatsPage.newMessages.length === 0) {
      MyApp.newDatas["chat"] = false;
    }
  }

  async ionViewDidEnter() {

    ChatFamilyPage.enableChat = true;

    //get message list
    await this.getMsg();
    let t = this;
    this.updateTimeMessage = setInterval(function () {
      console.log("changes pipe");
      t.changeDectRef.reattach();
    }, 30 * 1000);

    // Subscribe to received  new message events
    this.subscription.subscribeWithPush("chatFamily", function (msg) {
      // console.log(msg);
      this.pushNewMsg(msg);
    }.bind(this));

    this.showEmojiPicker = false;
    this.content.resize();
    this.scrollToBottom();

  }

  ionViewWillLeave() {
    // unsubscribe
    ChatFamilyPage.enableChat = false;
    window.clearInterval(this.updateTimeMessage);
    this.events.unsubscribe('chatFamily');
  }

  public loadImage(msg) {
    msg.loadImage = true;
  }

  public insertMsg(msg) {
    //<span class="triangle"></span>
    if (msg.hasOwnProperty("type") && msg.type === 'image') {
      return `<img src="${this.urlImg(msg.id)}" alt="">
      <p class="line-breaker ">${msg.text}</p>`
    }

    return `<p class="line-breaker ">${msg.text}</p>`
  }

  onFocus() {
    this.showEmojiPicker = false;
    this.content.resize();
    this.scrollToBottom();
  }

  switchEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
    if (!this.showEmojiPicker) {
      this.messageInput.setFocus();
    }

    this.content.resize();
    this.scrollToBottom();
  }

  /**
  * @name getMsg
  * @returns {Promise<ChatMessage[]>}
  */
  private async getMsg() {
    try {
      let ramdon = this.ramdon;
      let mgs: any = await this.http.get(`/chatfamily?where={"team":"${MyApp.User.team}"}&limit=3000`).toPromise();
      mgs = mgs.filter(it=>{
        return it.hasOwnProperty("user");
      }); console.log(mgs);
      this.msgList = await Promise.all(mgs.map(async function (item) {
        item.photo = interceptor.transformUrl("/images/" + ramdon + "/users&thumbnail/" + item.user);
        item.loadImage = false;
        return item;
      }));
    }
    catch (e) {
      console.error(e);
    }

  }

  /**
  * @name sendMsg
  */
  sendMsg() {
    if (!this.editorMsg.trim()) return;

    // Mock message
    let newMsgPost = {
      user: MyApp.User.id,
      text: this.editorMsg,
      team: MyApp.User.team,
      dateTime: moment().toISOString(),
      role: MyApp.User.role.name,
      username: MyApp.User.username,
      status: 'pending'
    };

    let newMsg = {
      user: MyApp.User,
      text: this.editorMsg,
      team: MyApp.User.team,
      dateTime: moment().toISOString(),
      role: MyApp.User.role.name,
      username: MyApp.User.username,
      status: 'pending'
    };

    this.pushNewMsg(newMsg);
    this.editorMsg = '';

    if (!this.showEmojiPicker) {
      this.messageInput.setFocus();
    }

    this.http.post("/chatfamily", newMsgPost).toPromise()
      .then((msg: any) => {
        let index = this.getMsgIndexById(msg.dateTime);
        if (index !== -1) {
          this.msgList[index].status = 'success';
        }
      })
  }

  public async sendMgsWitImage() {
    try {

      let image = await this.helper.Camera({});
      let preview = this.modal.create(PreviewImageChatComponent, { image });
      image = null;
      preview.present();
      preview.onDidDismiss(this.sendImage.bind(this));
    }
    catch (e) {
      console.error(e);
    }
  }

  private async sendImage(data) {
    if (data === undefined || data == null)
      return;

    try {
      let msg = {
        user: MyApp.User.id,
        role: MyApp.User.role.name,
        text: data.comment || "",
        username: MyApp.User.username,
        team: MyApp.User.team,
        "is": "message",
        image: data.image
      };

      msg = await this.http.post("/api/chat-family/image", msg).toPromise() as any;

    }
    catch (e) {
      console.error(e);
    }
  }

  public urlImg(id: string) {
    return interceptor.transformUrl(`/api/image/chat_family/${id}`);
  }

  /**
  * @name pushNewMsg
  * @param msg
  */
  async pushNewMsg(msg) {
    let index = this.getMsgIndexById(msg.dateTime);
    // console.log(msg, index);
    if (index === -1) {
      msg.photo = interceptor.transformUrl("/images/" + this.ramdon + "/users/" + msg.user);
      this.ngZone.run(() => { this.msgList.push(msg); });
      // console.log(ChatPage.enableChat);
      if (ChatFamilyPage.enableChat === true) {
        setTimeout(this.deleteNotificationLocal.bind(this), 1000);
      }
      this.scrollToBottom();
    }

  }

  getMsgIndexById(id: string) {
    return this.msgList.findIndex(e => e.dateTime === id)
  }

  scrollToBottom() {
    setTimeout(() => {
      if (this.content.scrollToBottom) {
        this.content.scrollToBottom();
      }
    }, 400)
  }

  public customTrackBy(index: number, obj: any): any {
    return index;
  }

}
