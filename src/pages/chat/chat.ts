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
import { ImageViewerController } from 'ionic-img-viewer';

/**
 * este es para chat de todo el equipo
 */
@IonicPage()
@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html',
})
export class ChatPage {

  public static __name = "ChatPage"

  @ViewChild(Content) content: Content;
  public loadingChats = false;
  private skip = 20;

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
    if (ChatPage.enableChat === false) return;
    ChatPage.changeMessages(payload);
  }

  private static changeMessages: Function = function (payload) { console.log(payload) };

  //Para scrolling infinite to up
  // @ViewChild(Content) content: Content;

  constructor(navParams: NavParams, private events: Events,
    private http: HttpClient, private ngZone: NgZone,
    public changeDectRef: ChangeDetectorRef, private subscription: WebSocketsProvider,
    public helper: HelpersProvider, public modal: ModalController,
    private imageViewerCtrl: ImageViewerController
  ) {

    this.ramdon = new Date().getTime();

    this.user = MyApp.User;

    let t = this;
    ChatPage.changeMessages = (payload) => {
      t.pushNewMsg(payload)
    };

    this.deleteNotificationLocal();
  }

  deleteNotificationLocal() {
    //Para quitar la notificacion local
    let index = ListChatsPage.newMessages.findIndex(function (id) { return id === "team"; });
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

  ngAfterViewInit() {
    //
    this.content.ionScrollEnd.subscribe((data) => {
      if (data) {
        if (data.scrollTop === 0 && data.directionY === "up") {
          this.loadingChats = true;
          this.loadingChatsUp();
        }
        this.ngZone.run(function () { console.log(data); });
      }
    })
  }

  private async loadingChatsUp() {
    try {
      let ramdon = this.ramdon;
      let mgs = await this.http.get(`/messages?where={"team":"${MyApp.User.team}"}&sort=dateTime DESC&limit=20&skip=${this.skip}`).toPromise() as any[];
      mgs = mgs.filter(it => {
        return it.hasOwnProperty("user") && it.hasOwnProperty("team");
      });

      if (mgs.length === 0) {
        this.loadingChats = false;
        return;
      }

      this.msgList = mgs.map(function (item) {
        item.photo = interceptor.transformUrl("/userprofile/images/" + item.user.id + "/" + MyApp.User.team);
        item.loadImage = false;
        return item;
      }).reverse().concat(this.msgList);
      this.skip += 20;
      this.loadingChats = false;
    }
    catch (e) {
      console.error(e);
    }
  }

  async ionViewDidEnter() {

    ChatPage.enableChat = true;

    //get name of team
    let team: any = await this.http.get("/teams/" + this.user.team).toPromise();
    this.nameTeam = team.name;

    //get message list
    await this.getMsg();
    let t = this;
    this.updateTimeMessage = setInterval(function () {
      console.log("changes pipe");
      t.changeDectRef.reattach();
    }, 30 * 1000);

    // Subscribe to received  new message events
    this.subscription.subscribeWithPush("message", function (msg) {
      // console.log(msg);
      this.pushNewMsg(msg);
    }.bind(this));

    this.showEmojiPicker = false;
    this.content.resize();
    this.scrollToBottom();

  }

  ionViewWillLeave() {
    // unsubscribe
    ChatPage.enableChat = false;
    window.clearInterval(this.updateTimeMessage);
    this.events.unsubscribe('message');
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
      let mgs = await this.http.get(`/messages?where={"team":"${MyApp.User.team}"}&sort=dateTime DESC&limit=20`).toPromise() as any[];
      mgs = mgs.filter(it => {
        return it.hasOwnProperty("user") && it.hasOwnProperty("team");
      });
      this.msgList = mgs.map(function (item) {
        item.photo = interceptor.transformUrl("/userprofile/images/" + item.user.id + "/" + MyApp.User.team);
        item.loadImage = false;
        return item;
      }).reverse();
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

    this.http.post("/messages", newMsgPost).toPromise()
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

      msg = await this.http.post("/api/chat/image", msg).toPromise() as any;

    }
    catch (e) {
      console.error(e);
    }
  }

  public urlImg(id: string) {
    return interceptor.transformUrl(`/api/image/messages/${id}`);
  }

  /**
  * @name pushNewMsg
  * @param msg
  */
  async pushNewMsg(msg) {
    let index = this.getMsgIndexById(msg.dateTime);
    // console.log(msg, index);
    if (index === -1) {
      msg.photo = interceptor.transformUrl("/userprofile/images/" + msg.user + "/" + MyApp.User.team);
      this.ngZone.run(() => { this.msgList.push(msg); });
      // console.log(ChatPage.enableChat);
      if (ChatPage.enableChat === true) {
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

  public showIfImage(msg) {
    if (msg.type === "image") {
      let img = new Image();
      let src = this.urlImg(msg.id);
      img.setAttribute("src", src);
      const imageViewer = this.imageViewerCtrl.create(img);
      imageViewer.present();
    }
  }

}
