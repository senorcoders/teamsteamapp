import { Component } from '@angular/core';
import { ViewController, NavParams, ModalController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { interceptor } from '../../providers/auth-service/interceptor';
import { ToChatToPerfilPlayerComponent } from '../to-chat-to-perfil-player/to-chat-to-perfil-player';

/**
 * este es para el traking o asistencia que se le muestra al manager
 */
@Component({
  selector: 'tracking-event-manager',
  templateUrl: 'tracking-event-manager.html'
})
export class TrackingEventManagerComponent {

  private event:any;
  public trackings:Array<any>=[];
  public trackingsFilter:Array<any>=[];
  private selectFilter='yes';
  public countYes:number=0;
  public countNo:number=0;
  public countMaybe:number=0;

  constructor(private viewCtrl: ViewController, private navParams: NavParams,
    private http: HttpClient, private modalCtrl: ModalController
  ) {
    this.event = this.navParams.get("e");
  }

  async ngOnInit(){
    try{
      let trackings:any = await this.http.get("/trackingevent/event/"+ this.event.id).toPromise();

      let t = this;

      console.log(trackings);
      this.trackings = await Promise.all( trackings.map( async function(item){
        item.imageSrc = interceptor.transformUrl("/images/random/users&thumbnail/"+ item.user.id);
        item.loadImage = false;

        if( item.info == 'yes' )
          t.countYes += 1;
        else if( item.info == 'no' )
          t.countNo += 1;
        else
          t.countMaybe += 1;

        return item;
      }) );
      await this.filter();
    }
    catch(e){
      console.error(e);
    }
  }

  public loadImage(user){
    user.loadImage = true;
  }

  filter(){
    let by = this.selectFilter;
    this.trackingsFilter = this.trackings.filter(function(item){
      return item.info === by;
    });

    return this.trackingsFilter;
  }

  select(by){
    this.selectFilter = by;
    this.filter();
  }

  public presentTo(user:any){
    console.log(user);
    this.modalCtrl.create(ToChatToPerfilPlayerComponent, {
      user: user
    }).present();
  }

}
