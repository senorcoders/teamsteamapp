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

  public players:Array<any>=[];
  public search:string='';
  public user:any={};

  constructor(public viewCtrl: ViewController, public navParams: NavController,
    public http: HttpClient, public navCtrl: NavController
  ) {
    this.user = MyApp.User;
  }

  async ngOnInit(){
    let team:any = await this.http.get("/team/"+ MyApp.User.team).toPromise();
    this.players = team._players;
    let managers:any = await this.http.get("/managers/team/"+ MyApp.User.team).toPromise();

    for(let it of managers){
      this.players.push(it);
    }
    
    this.players = await Promise.all(this.players.map(async (item)=>{
      item.show = true;
      return item;
    }));
    
  }

  //filtrando la lista de players con el valor de entrada del input search
  public async filter(){
    let sear = this.search;

    this.players = await Promise.all(this.players.map(async (item)=>{
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

  public async newChat(player){
    try{
      await this.navCtrl.push(ChatOnePersonPage, {
        user: player.user
      });

      this.viewCtrl.dismiss();
    }
    catch(e){
      console.error(e);
    }
  }

}
