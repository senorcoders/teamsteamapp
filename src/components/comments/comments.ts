import { Component, ViewChild, ChangeDetectorRef, NgZone } from '@angular/core';
import { interceptor } from '../../providers/auth-service/interceptor';
import { HttpClient } from '@angular/common/http';
import { NavParams, TextInput, Content, Events } from 'ionic-angular';
import { Observable} from 'rxjs/Observable';
import { MyApp } from '../../app/app.component';
import * as moment from 'moment';

/**
 * Generated class for the CommentsComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components
 */
@Component({
  selector: 'comments',
  templateUrl: 'comments.html'
})
export class CommentsComponent {

  @ViewChild(Content) content: Content;
  @ViewChild('chat_input') messageInput: TextInput;
  commentsList:any;
  editorMsg = '';
  showEmojiPicker = false;
  public nameTeam:string="";

  private updateTimeMessage:any;

  public user:any;
  
  event:any;
  eventName:string;
  
  constructor(public http: HttpClient, public navParams: NavParams,
    public changeDectRef: ChangeDetectorRef, public zone: NgZone,
    public eventPush: Events
  ) {
    let t = this;
    
    this.event = this.navParams.get("e");
    this.user = MyApp.User;
    this.commentsList = this.event.comments;
  }
  
  
  
  
  async ionViewDidEnter() {
    //get name of event
    this.eventName = this.event.name;
  
    //get message list
    this.commentsList = await Promise.all(this.commentsList.map(async function(item){
      let ramdon= new Date().getTime();
      item.photo = interceptor.transformUrl("/images/"+ ramdon+ "/users&thumbnail/"+ item.user);
      return item;
    }));

    let t = this;
    this.updateTimeMessage = setInterval(function(){
      console.log("changes pipe");
      t.changeDectRef.reattach();
    }, 30*1000);
  
    this.eventPush.subscribe('comment:received', (comment)=>{
      console.log(comment);
      this.pushNewComment(comment);
    });
  
    this.showEmojiPicker = false;
    this.content.resize();
    this.scrollToBottom();
    
  }

  ionViewDidLeave(){
    this.eventPush.unsubscribe('comment:received', ()=>{
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
  let comment = {
    user: MyApp.User.id,
    username: MyApp.User.username,
    content: this.editorMsg,
    event: this.event.id,
    dateTime: moment().toISOString(),
    status: 'pending'
  };
  
  this.pushNewComment(comment);
  this.editorMsg = '';
  
  if (!this.showEmojiPicker) {
    this.messageInput.setFocus();
  }
  
    this.http.post("/comments", comment).toPromise()
    .then((cmt:any) => {
      let index = this.getMsgIndexById(cmt.dateTime);
      if (index !== -1) {
          this.zone.run(()=>{
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
  async pushNewComment (comment) {
    let index = this.getMsgIndexById(comment.dateTime);
    console.log(comment, index);
    if (index === -1) {
      comment.photo = interceptor.transformUrl("/images/random/users/"+ comment.user);
      this.zone.run(()=>{ this.commentsList.push(comment); })
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

}
