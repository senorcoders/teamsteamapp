import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController, Loading, ModalController } from 'ionic-angular';
 import moment from 'moment';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { HttpClient } from '@angular/common/http';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { EventsSchedulePage } from '../events-schedule/events-schedule';
import { GoogleMapsComponent } from '../../components/google-maps/google-maps';
import { MyApp } from '../../app/app.component';
 

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
  public type:string="event";
  public repeats:boolean=false;
  public repeatsDaily:boolean=false;
  public repeatsDays:Array<any>=[];
  public date:string="";
  public time:string="";
  public attendeceTracking:boolean=false;
  public optionalInfo:string="";
  public description:string="";
  public address="";

  //for max date and min date asing in date time picker
  public minDate:string;
  public maxDate:string;


  constructor(public navCtrl: NavController, public navParams: NavParams,
    public alertCtrl: AlertController, public loading: LoadingController, 
    private auth: AuthServiceProvider, private http: HttpClient, 
    private helper:HelpersProvider, public modalCtrl: ModalController
  ) {
    this.team = this.navParams.get("team");
    console.log(this.team);
    this.maxDate = moment().add(2, "year",).format("YYYY");
    this.minDate = moment().subtract(1, "day").format("YYYY-MM-DD");
    console.log(this.minDate, this.maxDate);
  }

  public getSelectDays(key:string){
    return -1 !== this.repeatsDays.findIndex(function(el){ return el === key });
  }

  public selectDay(key:string){

    let index = this.repeatsDays.findIndex(function(el){ return el === key });
    console.log(index, key);
    if( index === -1 )
      this.repeatsDays.push(key);
    else{

      if( this.repeatsDays.length === 1 )
        this.repeatsDays = [];
      else
        this.repeatsDays.splice(index, 1);
      
    }

  }

  public showDaysRepeats():boolean{
    return this.repeats === true && this.repeatsDaily === false;
  }

  async ngOnInit(){
    /*let places = await this.helper.locationToPlaces(this.location.position);
    this.location.place = places[0];
    console.log(this.location);*/
  }

  public setDate(){
    this.helper.nativeDatePicker({ date : new Date(), mode: 'date' })
    .then(date=>{
      this.date = moment(date).format("DD MMM YYYY");
    })
  }

  public setTime(){
    this.helper.pickerDateTime(true)
    .then(date=>{
      this.time = date;
    })
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

  public async changePhoto(){
    let t = this, message = '';

    try{
      message = await this.helper.getWords("ERORUNEXC");

      this.helper.Camera({ width : 200, height: 200, quality: 50 }).then((result)=>{
        if( result ){
          t.imageSrc = result;
        }
      })
      .catch((err)=>{
        console.error(err);
        t.alertCtrl.create({
          title: "Error",
          message: message,
          buttons: ["Ok"]
        }).present();
      });

    }
    catch(e){
      console.error(e);
    }

  }

  public async save(){

    let content = await this.helper.getWords("SAVING"); 
    this.load = this.loading.create({ content: content });
    this.load.present({ disableApp: true });

    let requiredM = await this.helper.getWords("REQUIRED"),
    AddressOrMap = await this.helper.getWords("ADDRESSORDATE");

    if( this.location.change === false && this.address === '' ){
      this.alertCtrl.create({ title: requiredM, message: AddressOrMap, buttons: ["Ok"] }).present();
      this.load.dismiss();
      return;
    }

    //create el object fo send to location event
    let locate:any;
    if( this.location.change === false ){
      locate = {};
    }else{
      locate = this.location.position;
    }

    locate.address = this.address;
    locate.link = this.locationLink || "";
    locate.detail = this.locationDetail || "";
    
    console.log(locate);

    //Check if the fields required is ok
    let isRequired = await this.helper.getWords("ISREQUIRED");
    let nameM = await this.helper.getWords("NAME"),
    timeM = await this.helper.getWords("TIME");

    if( this.name === '' ){
      this.load.dismiss();
        this.alertCtrl.create({
          title: requiredM,
          message: nameM+ " "+ isRequired,
          buttons: ["Ok"]
        }).present();
        
        return;
    }
    
    if( this.time === '' ){
      this.load.dismiss();
        this.alertCtrl.create({
          title: requiredM,
          message: timeM+ " "+ isRequired,
          buttons: ["Ok"]
        }).present();
        
        return;
    }

    if( this.imageSrc == '' && this.type == "event" ){
      this.load.dismiss();
        this.alertCtrl.create({
          title: requiredM,
          message: "Image "+ isRequired,
          buttons: ["Ok"]
        }).present();
        return;
    }

    let event:any = {
      team: this.team,
      name : this.name,
      type : this.type,
     // attendeceTracking: this.attendeceTracking,
      optionalInfo : this.optionalInfo,
      description: this.description,
      user: MyApp.User.id,
      repeats: this.repeats,
      repeatsDaily: this.repeatsDaily,
      repeatsDays: this.repeatsDays.join(","),
      location: locate
    };
    console.log(event);

    //si es por semana entonces hay que chequear que este seleccionado almenos un dia
    let dayM = await this.helper.getWords("DAY");

    if( this.repeatsDaily === false && this.repeats === true ){
      
      if( this.repeatsDays.length === 0 ){
        this.load.dismiss();
        this.alertCtrl.create({ title: requiredM, message: dayM+ " "+ isRequired}).present();
        return;
      }else{
        event.dateTime = moment(this.time, "hh:mm a").toISOString();
      }

    }else if( this.repeats === false ){

      let dateM = await this.helper.getWords("DATE");
      if( this.date == '' ){
        this.load.dismiss();
        this.alertCtrl.create({
          title: "Required",
          message: dateM+ " "+ isRequired,
          buttons: ["Ok"]
        }).present();

        return;
      }

      event.dateTime = moment(this.date+ " "+ this.time, "DD MMM YYYY hh:mm a").toISOString();
    }else{
      event.dateTime = moment(this.time, "hh:mm a").toISOString();
    }

    let valid = true;
    let newEvent:any;
    try{
      newEvent = await this.http.post("/event", {
        event
      }).toPromise();
      console.log(newEvent);
      
      if( this.type === 'event' ){
        await this.http.post("/images/events", { id : newEvent.id, image : this.imageSrc }).toPromise();
      }


    }
    catch(e){
      console.error(e);
      valid = false;
    }
    
    let unexp = await this.helper.getWords("ERORUNEXC");
    if( valid === false ){
      this.load.dismiss();
      this.alertCtrl.create({
        title: "Error",
        message: unexp,
        buttons: ["Ok"]
      }).present();
      return;
    }

    this.load.dismiss();

    this.navCtrl.setRoot(EventsSchedulePage);

  }
  
}
