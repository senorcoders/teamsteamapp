import { Component } from '@angular/core';
import { ViewController, NavController } from 'ionic-angular';
import { MyApp } from '../../app/app.component';
import { HttpClient } from '@angular/common/http';
import { ChatOnePersonPage } from '../../pages/chat-one-person/chat-one-person';

@Component({
  selector: 'select-new-chat',
  templateUrl: 'select-new-chat.html'
})
export class SelectNewChatComponent {

  public static __name = "SelectNewChatComponent"

  public peoples:Array<any>=[];
  public search:string='';
  public user:any={};

  constructor(public viewCtrl: ViewController, public navParams: NavController,
    public http: HttpClient, public navCtrl: NavController
  ) {
    this.user = MyApp.User;
  }

  async ngOnInit(){
    let peoples = await this.http.get("/chat-list/"+ MyApp.User.id+ "/"+ MyApp.User.team+ "/"+ MyApp.User.role.name).toPromise() as Array<any>;
    this.peoples = peoples.map((it)=>{
      it.show = true;

      return it;
    });
  }

  //filtrando la lista de players con el valor de entrada del input search
  public async filter(){
    let sear = this.search;

    this.peoples = await Promise.all(this.peoples.map(async (item)=>{
      let usn = item.user.username.toLowerCase();
      if( sear === '' ){
        item.show = true;
      }else if( usn.includes(sear.toLowerCase()) ){
        item.show = true;
      }else{
        item.show = false;
      }
      
      return item;

    }));
  }

  public async newChat(people){
    try{
      let user = await this.http.get("/user/"+ people.id).toPromise();
      await this.navCtrl.push(ChatOnePersonPage, {
        user
      });

      this.viewCtrl.dismiss();
    }
    catch(e){
      console.error(e);
    }
  }

}
