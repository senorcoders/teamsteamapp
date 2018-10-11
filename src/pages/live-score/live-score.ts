import { Component, ViewChild, ChangeDetectorRef, NgZone } from '@angular/core';
import { interceptor } from '../../providers/auth-service/interceptor';
import { HttpClient } from '@angular/common/http';
import { NavParams, TextInput, Content, ViewController, ModalController, IonicPage } from 'ionic-angular';
import { MyApp } from '../../app/app.component';
import * as moment from 'moment';
import { ToChatToPerfilPlayerComponent } from '../../components/to-chat-to-perfil-player/to-chat-to-perfil-player';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { WebSocketsProvider } from '../../providers/web-sockets/web-sockets';

@IonicPage()
@Component({
  selector: 'page-live-score',
  templateUrl: 'live-score.html',
})
export class LiveScorePage {

  public static __name = "LiveScorePage"

  @ViewChild(Content) content: Content;
  @ViewChild('chat_input') messageInput: TextInput;
  public commentsList = [];
  editorMsg = '';
  showEmojiPicker = false;
  public nameTeam: string = "";

  private updateTimeMessage: any;

  public user: any;

  event: any;
  eventName: string;

  public us = 0;
  public period = 0;
  public them = 0;

  constructor(public http: HttpClient, public navParams: NavParams,
    public changeDectRef: ChangeDetectorRef, public zone: NgZone,
    public viewCtrl: ViewController, public modalCtrl: ModalController,
    public socket: WebSocketsProvider
  ) {
    this.event = this.navParams.get("event");
    this.user = MyApp.User;
  }

  async ionViewDidEnter() {
    //get name of event
    this.eventName = this.event.name;

    //Para obtener el score
    //Se obtiene el ultimo
    let scores = await this.http.get(`/scorepart?where={"game":"${this.event.id}"}&sort=createdAt%20DESC&limit=30000`).toPromise() as any[];
    this.us = scores[0].us;
    this.period = scores[0].period;
    this.them = scores[0].them;

    //get message list
    this.commentsList = await this.http.get(`/commentscorepart?where={"game":"${this.event.id}"}&limit=3000`).toPromise() as any[];
    this.commentsList = this.commentsList.map(function (item) {
      item.photo = interceptor.transformUrl("/userprofile/images/" + item.user.id + "/" + MyApp.User.team);
      return item;
    });

    //esta funcion es para actualizar la diferencida de tiempo
    let t = this;
    this.updateTimeMessage = setInterval(function () {
      console.log("changes pipe");
      t.changeDectRef.reattach();
    }, 30 * 1000);

    //suscripcion para cuando se recibe un nuevo commentario y score
    this.socket.subscribe("commentscorepart-added-" + this.event.id, this.pushNewComment.bind(this));

    this.socket.subscribe("scorepart-updated-" + this.event.id, function (score:any) {
      this.us = score.us;
      this.period = score.period;
      this.them = score.them;
    }.bind(this));

    this.showEmojiPicker = false;
    this.content.resize();
    this.scrollToBottom();

  }

  ionViewDidLeave() {
    clearInterval(this.updateTimeMessage);
  }

  public errorLoadImage(e) {
    e.target.src = "./assets/imgs/user-menu.png";
  }

  public async updateScore() {
    try {
      //Comprobamos que ninguno de los campos este vacio
      console.log(this.us.toString(), this.period.toString(), this.them.toString());
      if (this.us.toString() === "" || this.period.toString() === "" || this.them.toString() === "") return;

      let score = {
        game: this.event.id,
        us: this.us,
        period: this.period,
        them: this.them
      };
      await this.http.post("/scorepart", score).toPromise();
    }
    catch (e) {
      console.error(e);
      HelpersProvider.me.presentAlertErrorStandar();
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
  * @name sendMsg
  */
  sendComment() {
    if (!this.editorMsg.trim()) return;

    // Mock message
    let dateTime = moment().toISOString();
    let commentPost = {
      user: MyApp.User.id,
      text: this.editorMsg,
      game: this.event.id,
      dateTime,
      status: 'pending'
    };

    let comment = {
      user: MyApp.User,
      text: this.editorMsg,
      game: this.event.id,
      dateTime,
      status: 'pending'
    };

    this.pushNewComment(comment);
    this.editorMsg = '';

    if (!this.showEmojiPicker) {
      this.messageInput.setFocus();
    }

    this.http.post("/commentscorepart", commentPost).toPromise()
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
      comment.photo = interceptor.transformUrl("/userprofile/images/" + comment.user.id + "/" + MyApp.User.team);
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
