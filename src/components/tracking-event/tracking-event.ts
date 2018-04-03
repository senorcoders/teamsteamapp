import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { MyApp } from '../../app/app.component';

/* este es para el traking o asistencia al evento */
@Component({
  selector: 'tracking-event',
  templateUrl: 'tracking-event.html'
})
export class TrackingEventComponent {

  public event:any={};
  public tracking:any={};

  constructor(public viewCtrl: ViewController, private navParams: NavParams,
  private http: HttpClient
  ) {
    this.event = this.navParams.get("e");
    console.log(this.navParams.data, this.event);
  }

  async ngOnInit(){

    try{
      this.tracking = await this.http.get("/traking/query/"+ MyApp.User.id+ "/"+ this.event.id).toPromise();
      console.log(this.tracking);
    }
    catch(e){
      console.error(e);
    }

  }

  //asigna una respuesta al evento si no esta creada se crea
  async asingResponse(response){
    let guardar = this.tracking.user !== undefined;
    try{
      let newTrack:any;
      if( guardar === false ){
        newTrack = await this.http.post("/trackingevent", { user: MyApp.User.id, event: this.event.id, info: response })
        .toPromise();
        this.tracking = newTrack;
      }else{
        newTrack = await this.http.put("/trackingevent/"+ this.tracking.id, { info: response }).toPromise();
        this.tracking = newTrack;
      }
      this.viewCtrl.dismiss();
    }
    catch(e){
      console.error(e);
    }
  }

}
