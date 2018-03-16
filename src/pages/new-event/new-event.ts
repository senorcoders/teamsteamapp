import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController, Loading, ModalController } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
 import moment from 'moment';
import { VALID } from '@angular/forms/src/model';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { HttpClient } from '@angular/common/http';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { EventsSchedulePage } from '../events-schedule/events-schedule';
import { GoogleMapsComponent } from '../../components/google-maps/google-maps';
import { Observable } from 'rxjs/Observable';
 

/**
 * Generated class for the NewEventPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-new-event',
  templateUrl: 'new-event.html',
})
export class NewEventPage {

  private team:any;

  load:Loading;
  public image:boolean=false;
  public imageSrc:string="";

  public location:any={
    position : { lat: 51.5033640, lng : -0.12762500 },
    place : {
      subAdministrativeArea:"",
      thoroughfare:""
    },
    change: false
  };

  //var for inputs location
  public locationLink:string;
  public locationDetail:string;

  //var for inputs event
  public name:string="";
  public shortLabel:string;
  public repeats:string="no-repeat";
  public repeatsOption:string="monday";
  public date:string="";
  public time:string="";
  public attendeceTracking:boolean=false;
  public notifyTeam:boolean=false;
  public optionalInfo:string="";
  public description:string="";

  //for max date and min date asing in date time picker
  public minDate:string;
  public maxDate:string;


  constructor(public navCtrl: NavController, public navParams: NavParams,
    public alertCtrl: AlertController,
    public loading: LoadingController, public camera: Camera, 
    private auth: AuthServiceProvider, private http: HttpClient, 
    private helper:HelpersProvider, public modalCtrl: ModalController
  ) {
    this.team = this.navParams.get("team");
    console.log(this.team);
    this.maxDate = moment().add(2, "year",).format("YYYY");
    this.minDate = moment().subtract(1, "day").format("YYYY-MM-DD");
    console.log(this.minDate, this.maxDate);
  }

  async ngOnInit(){
    /*let places = await this.helper.locationToPlaces(this.location.position);
    this.location.place = places[0];
    console.log(this.location);*/
  }

  //#region for change photo
  public success(){
    this.image = true;
  }

  public loadPlace(){
    let modal = this.modalCtrl.create(GoogleMapsComponent);
    let t = this;
    modal.onDidDismiss(async function(data:any){
      if(data){
        t.location.position = data;
        let places = await t.helper.locationToPlaces(t.location.position);
        t.location.place = places[0];
        t.location.change = true;
      }
    });
    modal.present();
  }

  public changePhoto(){
    let t = this;
    //console.log(this);
    this.helper.Camera({ width : 200, height: 200, quality: 50 }).then((result)=>{
      if( result ){
        t.imageSrc = result;
      }
    })
    .catch((err)=>{
      console.error(err);
      t.alertCtrl.create({
        title: "Error",
        message: "Unexpected Error",
        buttons: ["Ok"]
      }).present();
    });

  }

  public async save(){

    this.load = this.loading.create({ content: "Saving..." });
    this.load.present({ disableApp: true });

    if( this.location.change === false ){
      this.load.dismiss();
      this.alertCtrl.create({ title: "Required", message: "select a position for event in map", buttons: ["Ok"]})
      .present();
      return;
    }

    //create el object fo send to location event
    let location:any = this.location.position;
    location.link = this.locationLink || "";
    location.detail = this.locationDetail || "";

    console.log(location);

    //Check if the fields required is ok
    let inputsRequired = ["name", "time"], valid = true;
    for(let name of inputsRequired){
      if( this[name] == "" ){
        this.load.dismiss();
        this.alertCtrl.create({
          title: "Required",
          message: name.toUpperCase()+ " Is Required",
          buttons: ["Ok"]
        }).present();
        valid = false;
        break;
      }
    }
    
    if( valid === false ){
      return;
    }

    if( this.imageSrc == '' ){
      this.load.dismiss();
        this.alertCtrl.create({
          title: "Required",
          message: "Image Is Required",
          buttons: ["Ok"]
        }).present();
        return;
    }

    //let stringbase4Image = await this.helper.urlTobase64(this.imageSrc);

    let event:any = {
      team: this.team.team,
      name : this.name,
      shortLabel : this.shortLabel,
      attendeceTracking: this.attendeceTracking,
      notifyTeam: this.notifyTeam,
      optionalInfo : this.optionalInfo,
      description: this.description,
      user: this.auth.User().id,
      repeats: this.repeats
    };

    if( this.repeats == "weekly" ){
      event.repeatsOption = this.repeatsOption;
      event.dateTime = moment().format("YYYY/MM/DD")+ " "+this.time;
    }else if( this.repeats == 'no-repeat' ){

      if( this.date == '' ){
        this.load.dismiss();
        this.alertCtrl.create({
          title: "Required",
          message:"Date Is Required",
          buttons: ["Ok"]
        }).present();

        return;
      }

      event.dateTime = this.date+ " "+ this.time;
    }else{
      event.dateTime = moment().format("YYYY/MM/DD")+ " "+this.time;
    }

    valid = true;
    let newEvent:any;
    try{
      newEvent = await this.http.post("/event", {
        event,
        location
      }).toPromise();
      console.log(newEvent);
      
      await this.http.post("/images/events", { id : newEvent.event.id, image : this.imageSrc }).toPromise();
      

    }
    catch(e){
      console.error(e);
      valid = false;
    }
    
    if( valid === false ){
      this.load.dismiss();
      this.alertCtrl.create({
        title: "Error",
        message: "Unexpected Error",
        buttons: ["Ok"]
      }).present();
      return;
    }

    this.load.dismiss();

    this.navCtrl.setRoot(EventsSchedulePage);

  }
  
}
