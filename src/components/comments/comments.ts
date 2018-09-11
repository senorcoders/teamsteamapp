import { Component, ViewChild, ChangeDetectorRef, NgZone } from '@angular/core';
import { interceptor } from '../../providers/auth-service/interceptor';
import { HttpClient } from '@angular/common/http';
import { NavParams, TextInput, Content, Events, ViewController, ModalController } from 'ionic-angular';
import { MyApp } from '../../app/app.component';
import * as moment from 'moment';
import { ToChatToPerfilPlayerComponent } from '../to-chat-to-perfil-player/to-chat-to-perfil-player';

@Component({
  selector: 'comments',
  templateUrl: 'comments.html'
})
export class CommentsComponent {

  @ViewChild(Content) content: Content;
  @ViewChild('chat_input') messageInput: TextInput;
  public commentsList=[];
  editorMsg = '';
  showEmojiPicker = false;
  public nameTeam: string = "";

  private updateTimeMessage: any;

  public user: any;

  event: any;
  eventName: string;

  constructor(public http: HttpClient, public navParams: NavParams,
    public changeDectRef: ChangeDetectorRef, public zone: NgZone,
    public eventPush: Events, public viewCtrl: ViewController,
    public modalCtrl: ModalController
  ) {
    this.event = this.navParams.get("e");
    this.user = MyApp.User;
  }




  async ionViewDidEnter() {
    //get name of event
    this.eventName = this.event.name;

    //get message list
    this.commentsList = await this.http.get(`/comments?where={"event":"${this.event.id}"}&limit=3000`).toPromise() as any[];
    this.commentsList = this.commentsList.map(function (item) {
      let ramdon = new Date().getTime();
      item.photo = interceptor.transformUrl("/images/" + ramdon + "/users/" + item.user.id+ "-thumbnail");
      return item;
    });

    console.log(this.commentsList);

    //esta funcion es para actualizar la diferencida de tiempo
    let t = this;
    this.updateTimeMessage = setInterval(function () {
      console.log("changes pipe");
      t.changeDectRef.reattach();
    }, 30 * 1000);

    //suscripcion para cuando se recibe un nuevo commentario por medio de push notifications
    this.eventPush.subscribe('comment:received', (comment) => {
      console.log(comment);
      this.pushNewComment(comment);
    });

    this.showEmojiPicker = false;
    this.content.resize();
    this.scrollToBottom();

  }

  ionViewDidLeave() {
    clearInterval(this.updateTimeMessage);
    this.eventPush.unsubscribe('comment:received', () => {
      console.log("unsubscribe comment")
    });
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
  * @name sendMsg
  */
  sendComment() {
    if (!this.editorMsg.trim()) return;

    // Mock message
    let dateTime = moment().toISOString();
    let commentPost = {
      user: MyApp.User.id,
      username: MyApp.User.username,
      content: this.editorMsg,
      event: this.event.id,
      dateTime,
      status: 'pending'
    };

    let comment = {
      user: MyApp.User,
      username: MyApp.User.username,
      content: this.editorMsg,
      event: this.event.id,
      dateTime,
      status: 'pending'
    };

    this.pushNewComment(comment);
    this.editorMsg = '';

    if (!this.showEmojiPicker) {
      this.messageInput.setFocus();
    }

    this.http.post("/comments", commentPost).toPromise()
      .then((cmt: any) => {
        let index = this.getMsgIndexById(cmt.dateTime);
        if (index !== -1) {
          this.zone.run(() => {
            this.commentsList[index].status = 'success';
            console.log(this.commentsList);
          });
        }
      })
  }

  /**
  * @name pushNewComment
  * @param msg
  */
  async pushNewComment(comment) {
    let index = this.getMsgIndexById(comment.dateTime);
    console.log(comment, index);
    if (index === -1) {
      comment.photo = interceptor.transformUrl("/images/random/users/" + comment.user+ "-thumbnail");
      this.zone.run(() => { this.commentsList.push(comment); })
      console.log("add new comment", this.commentsList);
      this.scrollToBottom();
    }

  }

  getMsgIndexById(id: string) {
    return this.commentsList.findIndex(e => e.dateTime === id)
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

  public exit() {
    this.viewCtrl.dismiss();
  }

  public async presentTo(idUser: any) {

    if (MyApp.User.id === idUser)
      return;

    let user = await this.http.get("/user/" + idUser).toPromise();
    this.modalCtrl.create(ToChatToPerfilPlayerComponent, {
      user: user
    }).present();
  }

}
