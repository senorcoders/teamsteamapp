import { Component, ViewChild, NgZone, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Events, Content, TextInput } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { MyApp } from '../../app/app.component';
import * as moment from 'moment';
import { interceptor } from '../../providers/auth-service/interceptor';
import { RelativeTimePipe } from '../../pipes/relative-time/relative-time';
import { Observable} from 'rxjs/Observable'
import 'rxjs/add/operator/map';
import { toObservable } from '@angular/forms/src/validators';
import 'rxjs/add/observable/fromEvent';
import * as Rx from 'rxjs';

/**
 * Generated class for the ChatPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html',
})
export class ChatPage {

  @ViewChild(Content) content: Content;
  @ViewChild('chat_input') messageInput: TextInput;
  msgList:any;
  msgListObserver:Observable<Array<any>>;
  editorMsg = '';
  showEmojiPicker = false;
  public nameTeam:string="";

  private updateTimeMessage:any;

  public user:any;

  private static enableChat:boolean=false;
  public static eventChat:Function= (payload:any)=>{
    if( ChatPage.enableChat === false ) return;
    ChatPage.changeMessages(payload);
  }

  private static changeMessages:Function=function(payload){ console.log(payload) };

  constructor(navParams: NavParams,
    private events: Events, private http: HttpClient,
    private ngZone: NgZone, public changeDectRef: ChangeDetectorRef
  ) {
  
      this.user = MyApp.User;

      ChatPage.enableChat = true;

      let t = this;
      ChatPage.changeMessages=(payload)=>{
        t.pushNewMsg(payload)
      };
}

ionViewWillLeave() {
  // unsubscribe
  ChatPage.enableChat = false;
  window.clearInterval(this.updateTimeMessage);
  this.events.unsubscribe('chat:received');
}

async ionViewDidEnter() {
  //get name of team
  let team:any = await this.http.get("/teams/"+ this.user.team).toPromise();
  this.nameTeam = team.name;

  //get message list
  await this.getMsg();
  let t = this;
  this.updateTimeMessage = setInterval(function(){
    console.log("changes pipe");
    t.changeDectRef.reattach();
  }, 30*1000);

  // Subscribe to received  new message events
  this.events.subscribe('chat:received', msg => {
    console.log(msg);
    this.pushNewMsg(msg);
  });

  this.showEmojiPicker = false;
  this.content.resize();
  this.scrollToBottom();
  
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
  try{
    let mgs:any = await this.http.get("/messages/team/"+ MyApp.User.team).toPromise();
    this.msgList = await Promise.all(mgs.map(async function(item){
      let ramdon= new Date().getTime();
      item.photo = interceptor.transformUrl("/images/"+ ramdon+ "/users&thumbnail/"+ item.user);
      return item;
    }));

    /*this.msgListObserver = Rx.Observable.from(this.msgList).toArray();
    this.msgListObserver.subscribe(x => {console.log("new: ", x)});*/
  }
  catch(e){
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
  dateTime : moment().toISOString(),
  role : MyApp.User.role.name,
  username: MyApp.User.username,
  status: 'pending'
};

this.pushNewMsg(newMsg);
this.editorMsg = '';

if (!this.showEmojiPicker) {
  this.messageInput.setFocus();
}

  this.http.post("/messages", newMsg).toPromise()
  .then((msg:any) => {
    let index = this.getMsgIndexById(msg.dateTime);
    if (index !== -1) {
        this.msgList[index].status = 'success';
    }
  })
}

/**
* @name pushNewMsg
* @param msg
*/
async pushNewMsg (msg) {
  let index = this.getMsgIndexById(msg.dateTime);
  console.log(msg, index);
  if (index === -1) {
    msg.photo = interceptor.transformUrl("/images/random/users/"+ msg.user);
    this.ngZone.run(()=>{ this.msgList.push(msg); })
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
