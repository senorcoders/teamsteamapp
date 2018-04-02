import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { interceptor } from '../../providers/auth-service/interceptor';

/**
 * Generated class for the TrackingEventManagerComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'tracking-event-manager',
  templateUrl: 'tracking-event-manager.html'
})
export class TrackingEventManagerComponent {

  private event:any;
  public trackings:Array<any>=[];
  public trackingsFilter:Array<any>=[];
  private selectFilter:string='yes';

  constructor(private viewCtrl: ViewController, private navParams: NavParams,
    private http: HttpClient
  ) {
    this.event = this.navParams.get("e");
  }

  async ngOnInit(){
    try{
      let trackings:any = await this.http.get("/trackingevent/event/"+ this.event.id).toPromise();
      console.log(trackings);
      this.trackings = await Promise.all( trackings.map( async function(item){
        item.imageSrc = interceptor.transformUrl("/images/random/users&thumbnail/"+ item.user.id);
        return item;
      }) );
      await this.filter();
    }
    catch(e){
      console.error(e);
    }
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



}
