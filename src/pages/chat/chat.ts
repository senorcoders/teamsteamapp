import { Component, ViewChild, NgZone, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavParams, ModalController } from 'ionic-angular';
import { Events, Content, TextInput } from 'ionic-angular';
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

/**
 * este es para chat de todo el equipo
 */
@IonicPage()
@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html',
})
export class ChatPage {

  @ViewChild(Content) content: Content;
  @ViewChild('chat_input') messageInput: TextInput;
  msgList: any;
  msgListObserver: Observable<Array<any>>;
  editorMsg = '';
  showEmojiPicker = false;
  public nameTeam: string = "";

  private updateTimeMessage: any;

  public user: any;

  private static enableChat: boolean = false;
  public static eventChat: Function = (payload: any) => {
    if (ChatPage.enableChat === false) return;
    ChatPage.changeMessages(payload);
  }

  private static changeMessages: Function = function (payload) { console.log(payload) };

  constructor(navParams: NavParams, private events: Events,
    private http: HttpClient, private ngZone: NgZone,
    public changeDectRef: ChangeDetectorRef, private subscription: WebSocketsProvider,
    public helper: HelpersProvider, public modal: ModalController
  ) {

    this.user = MyApp.User;

    ChatPage.enableChat = true;

    let t = this;
    ChatPage.changeMessages = (payload) => {
      t.pushNewMsg(payload)
    };
  }

  async ionViewDidEnter() {
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
      console.log(msg);
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

  public insertMsg(msg){
    if( msg.hasOwnProperty("type") && msg.type === 'image'){
      return `<span class="triangle"></span>
      <img src="${this.urlImg(msg.id)}" alt="">
      <p class="line-breaker ">${msg.text}</p>`
    }

    return `<span class="triangle"></span>
      <p class="line-breaker ">${msg.text}</p>`
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
      let mgs: any = await this.http.get("/messages/team/" + MyApp.User.team).toPromise();
      this.msgList = await Promise.all(mgs.map(async function (item) {
        let ramdon = new Date().getTime();
        item.photo = interceptor.transformUrl("/images/" + ramdon + "/users&thumbnail/" + item.user);
        return item;
      }));
      //console.log(this.msgList);
      /*this.msgListObserver = Rx.Observable.from(this.msgList).toArray();
      this.msgListObserver.subscribe(x => {console.log("new: ", x)});*/
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
    let newMsg = {
      user: MyApp.User.id,
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

    this.http.post("/messages", newMsg).toPromise()
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
    if(data === undefined || data == null)
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

  public urlImg(id:string){
    return interceptor.transformUrl(`/api/image/messages/${id}`);
  }

  /**
  * @name pushNewMsg
  * @param msg
  */
  async pushNewMsg(msg) {
    let index = this.getMsgIndexById(msg.dateTime);
    console.log(msg, index);
    if (index === -1) {
      msg.photo = interceptor.transformUrl("/images/random/users/" + msg.user);
      this.ngZone.run(() => { this.msgList.push(msg); })
      console.log("add new message", this.msgList);
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
