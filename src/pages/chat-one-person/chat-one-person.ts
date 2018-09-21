import { Component, ViewChild, NgZone, ChangeDetectorRef } from '@angular/core';
import { IonicPage, Content, NavParams, TextInput, ModalController, ToastController } from 'ionic-angular';
import { MyApp } from '../../app/app.component';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable'
import { interceptor } from '../../providers/auth-service/interceptor';
import * as moment from 'moment';
import { WebSocketsProvider } from '../../providers/web-sockets/web-sockets';
import { PreviewImageChatComponent } from '../../components/preview-image-chat/preview-image-chat';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { ListChatsPage } from '../list-chats/list-chats';

/**
 * este es para chat entre el manager y un solo jugador
 */
@IonicPage()
@Component({
  selector: 'page-chat-one-person',
  templateUrl: 'chat-one-person.html',
})
export class ChatOnePersonPage {
  @ViewChild(Content) content: Content;
  public loadingChats = false;
  private skip = 20;

  @ViewChild('chat_input') messageInput: TextInput;
  msgList: any[];
  msgListObserver: Observable<Array<any>>;
  editorMsg = '';
  showEmojiPicker = false;
  public nameTeam: string = "";

  private updateTimeMessage: any;

  public to: any;
  public from: any;

  public _photoReady = false;
  public photo = "";

  //private static enableChat: boolean = false;
  public static eventChat: Function = (payload: any) => {
    /*if( ChatPage.enableChat === false ) return;
    ChatPage.changeMessages(payload);*/
  }

  //private static changeMessages: Function = function (payload) { console.log(payload) };

  constructor(private http: HttpClient,
    private ngZone: NgZone, public changeDectRef: ChangeDetectorRef,
    public navParams: NavParams, public sockets: WebSocketsProvider,
    public helper: HelpersProvider, public modal: ModalController,
    public toastCtrl: ToastController
  ) {
    this.to = this.navParams.get("user");
    this.from = MyApp.User;
    if (this.to.hasOwnProperty('_id')) {
      this.to.id = this.to._id;
      delete this.to._id;
    }

    this.deleteNotificationLocal();
  }

  deleteNotificationLocal() {
    //Para quitar la notificacion local
    let ide = this.to.id;
    let index = ListChatsPage.newMessages.findIndex(function (id) { return id === ide; });
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
      let query = { "or": [{ to: this.to.id, from: this.from.id }, { from: this.to.id, to: this.from.id }] };

      let mgs = await this.http.get(`/chat?where=${JSON.stringify(query)}&sort=dateTime DESC&limit=20&skip=${this.skip}`).toPromise() as any[];
      mgs = mgs.filter(it => {
        return it.hasOwnProperty("from") && it.hasOwnProperty("to");
      });

      if (mgs.length === 0) {
        this.loadingChats = false;
        return;
      }

      this.msgList = mgs.reverse().concat(this.msgList);
      this.skip += 20;
      this.loadingChats = false;
    }
    catch (e) {
      console.error(e);
    }
  }

  async ionViewDidLoad() {
    //Para saber si el manager bloqueo los mensajes con los otros jugadores
    let team = await this.http.get("/teams/" + MyApp.User.team).toPromise() as any;
    if (team.configuration !== undefined) {
      let confi = team.configuration;
      if (confi.hasOwnProperty("chatEachPlayer") === true) {
        if (confi.chatEachPlayer === false) {
          await this.notEachPlayer();
        }
      }
    }

    this.photo = interceptor.transformUrl("/userprofile/images/" + this.to.id + "/" + MyApp.User.team);
  }

  async ionViewDidEnter() {

    //get message list
    await this.getMsg();
    let t = this;
    this.updateTimeMessage = setInterval(function () {
      t.changeDectRef.reattach();
    }, 30 * 1000);

    // Subscribe to received  new message events
    this.sockets.subscribeWithPush("chat", function (msg) {
      this.pushNewMsg(msg);
    }.bind(this));

    this.showEmojiPicker = false;
    this.content.resize();
    this.scrollToBottom();

  }

  private async notEachPlayer() {
    let message = await HelpersProvider.me.getWords("NOTCHATEACHPLAYER");
    this.toastCtrl.create({
      message,
      showCloseButton: true,
      dismissOnPageChange: true
    })
      .present();
  }

  ionViewWillLeave() {
    // unsubscribe
    window.clearInterval(this.updateTimeMessage);
    this.sockets.unsubscribeWithPush("chat");
  }

  public insertMsg(msg) {
    //<span class="triangle"></span>
    if (msg.hasOwnProperty("type") && msg.type === 'image') {
      return `
      <img src="${this.urlImg(msg.id)}" alt="">
      <p class="line-breaker ">${msg.text}</p>`
    }

    return `
      <p class="line-breaker ">${msg.text}</p>`
  }

  public urlImg(id: string) {
    return interceptor.transformUrl(`/api/image/chats/${id}`);
  }

  photoReady() {
    this._photoReady = true;
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
    console.log(data)
    if (data === undefined || data == null)
      return;

    let msg: any = {
      "is": "chat",
      from: this.from.id,
      to: this.to.id,
      text: data.comment || "",
      team: MyApp.User.team,
      image: data.image,
      status: 'pending',
      dateTime: moment().toISOString(),
    };
    try {
      let msgPost = JSON.parse(JSON.stringify(msg));
      msg.from = this.from;
      this.pushNewMsg(msg);
      await this.http.post("/api/chat/image", msgPost).toPromise();
      let index = this.getMsgIndexById(msg.dateTime);
      if (index !== -1) {
        this.msgList[index].status = 'success';
      }
    }
    catch (e) {
      console.error(e);
      if (e.error === "not chat each player") {
        await this.notEachPlayer();
      }
    }
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
      let query = { "or": [{ to: this.to.id, from: this.from.id }, { from: this.to.id, to: this.from.id }] };
      let mgs = await this.http.get(`/chat?where=${JSON.stringify(query)}&sort=dateTime DESC&limit=20`).toPromise() as any[];
      this.msgList = mgs.map(function (item) {
        item.photo = interceptor.transformUrl("/userprofile/images/" + item.to.id + "/" + MyApp.User.team);
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
  public async sendMsg() {
    if (!this.editorMsg.trim()) return;

    // Mock message
    let newMsg = {
      from: this.from.id,
      to: this.to.id,
      text: this.editorMsg,
      team: MyApp.User.team,
      dateTime: moment().toISOString(),
      status: 'pending'
    };

    let newMsgPost = JSON.parse(JSON.stringify(newMsg));
    newMsg.from = this.from;
    this.pushNewMsg(newMsg);
    this.editorMsg = '';

    if (!this.showEmojiPicker) {
      this.messageInput.setFocus();
    }

    try {
      let msg = await this.http.post("/chat", newMsgPost).toPromise() as any;
      let index = this.getMsgIndexById(msg.dateTime);
      if (index !== -1) {
        this.msgList[index].status = 'success';
      }
    }
    catch (e) {
      console.error(e);
      if (e.error.originalError === "not chat each player") {
        let index = this.getMsgIndexById(newMsg.dateTime);
        if (index !== -1) {
          if (this.msgList.length === 1)
            this.msgList = [];
          else
            this.msgList.splice(index, 1);
        }
        await this.notEachPlayer();
      }
    }
  }

  /**
  * @name pushNewMsg
  * @param msg
  */
  async pushNewMsg(msg) {
    let index = this.getMsgIndexById(msg.dateTime);
    //console.log(msg, index);
    if (index === -1) {
      msg.photo = interceptor.transformUrl("/userprofile/images/" + msg.from + "/" + MyApp.User.team);
      this.ngZone.run(() => { this.msgList.push(msg); })
      //console.log("add new message", this.msgList);
      this.scrollToBottom();
      setTimeout(this.deleteNotificationLocal.bind(this), 1000);
    }

  }

  getMsgIndexById(id: string) {
    return this.msgList.findIndex(e => e.dateTime === id)
  }

  scrollToBottom() {
    setTimeout(() => {
      if (this.content.scrollToBottom) {
        this.content.scrollToBottom(300);
      }
    }, 400)
  }

  public customTrackBy(index: number, obj: any): any {
    return index;
  }


}
