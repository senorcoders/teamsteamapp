import { Component, ViewChild, NgZone, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavController, Content, Events, NavParams, TextInput } from 'ionic-angular';
import { MyApp } from '../../app/app.component';
import { HttpClient } from '@angular/common/http';
import { Observable} from 'rxjs/Observable'
import { interceptor } from '../../providers/auth-service/interceptor';
import * as moment from 'moment';

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
  @ViewChild('chat_input') messageInput: TextInput;
  msgList:any;
  msgListObserver:Observable<Array<any>>;
  editorMsg = '';
  showEmojiPicker = false;
  public nameTeam:string="";

  private updateTimeMessage:any;

  public to:any;
  public from:any;

  private static enableChat:boolean=false;
  public static eventChat:Function= (payload:any)=>{
    /*if( ChatPage.enableChat === false ) return;
    ChatPage.changeMessages(payload);*/
  }

  private static changeMessages:Function=function(payload){ console.log(payload) };

  constructor(private events: Events, private http: HttpClient,
    private ngZone: NgZone, public changeDectRef: ChangeDetectorRef,
    public navParams: NavParams) {
    this.to = this.navParams.get("user");
    this.from = MyApp.User;
    if( this.to.hasOwnProperty('_id') ){
      this.to.id = this.to._id;
      delete this.to._id;
    }
  }

  ionViewWillLeave() {
    // unsubscribe
    window.clearInterval(this.updateTimeMessage);
    this.events.unsubscribe('chatOne:received');
  }
  
  async ionViewDidEnter() {
    
    //get message list
    await this.getMsg();
    let t = this;
    this.updateTimeMessage = setInterval(function(){
      console.log("changes pipe");
      t.changeDectRef.reattach();
    }, 30*1000);
  
    // Subscribe to received  new message events
    this.events.subscribe('chatOne:received', msg => {
      console.log(msg);
      msg.from = msg._from;
      delete msg._from;
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
      let mgs:any = await this.http.get("/chat/"+ this.to.id+ "/"+ this.from.id).toPromise();
      console.log(mgs);
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
    from: this.from.id,
    to: this.to.id,
    text: this.editorMsg,
    dateTime : moment().toISOString(),
    status: 'pending'
  };
  
  this.pushNewMsg(newMsg);
  this.editorMsg = '';
  
  if (!this.showEmojiPicker) {
    this.messageInput.setFocus();
  }
  
    this.http.post("/chat", newMsg).toPromise()
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
