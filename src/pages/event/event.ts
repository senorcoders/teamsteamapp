import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController, Loading, ModalController } from 'ionic-angular';
import * as moment from 'moment';

import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  GoogleMapOptions
 } from '@ionic-native/google-maps';
import { EditEventPage } from '../edit-event/edit-event';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { HttpClient } from '@angular/common/http';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { EventsSchedulePage } from '../events-schedule/events-schedule';
import { interceptor } from '../../providers/auth-service/interceptor';
import { MyApp } from '../../app/app.component';;
import { PhotoViewer } from '@ionic-native/photo-viewer';
import { ViewTrakingComponent } from '../../components/view-traking/view-traking';
import { TrackingEventManagerComponent } from '../../components/tracking-event-manager/tracking-event-manager';

declare var google:any;

@IonicPage()
@Component({
  selector: 'page-event',
  templateUrl: 'event.html',
})
export class EventPage {

  map: GoogleMap;
  load:Loading;

  public loadImage=false;

  private tracking:any;

  private index = 0;

  public user:any;
  public event:any;

  public imgUser:string="";
  public username:string="";

  public location:any={
    position : { lat: 51.5033640, lng : -0.12762500 },
    place : {
      placesubAdministrativeArea:"",
      thoroughfare:""
    },
    change: false
  };

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public loading: LoadingController, public alertCtrl: AlertController,
    private http: HttpClient, public auth: AuthServiceProvider, public helper:HelpersProvider,
    public photoViewer: PhotoViewer, public modalCtrl: ModalController, 
    private zone: NgZone
  ) {
    //this.init();
    let e = this.navParams.get("event");
    console.log(e);
    this.user = MyApp.User;

    if( !e.hasOwnProperty("comments") ){
      e.comments = [];
    }

    if( !e.location.hasOwnProperty("address") ){
      e.location.address = [];
    }

    this.event = e;
    this.index = this.navParams.get("index");
    console.log(this.index);

    //for image user that published events
    let r = new Date().getTime();
    this.imgUser = interceptor.transformUrl("/images/"+ r+ "/users&thumbnail/"+ this.event.user);
  }

  async ngOnInit(){
    
    //para obtener los trackings del evento
    try{
      this.tracking = await this.http.get("/traking/query/"+ MyApp.User.id+ "/"+ this.event.id).toPromise();
      console.log(this.tracking);
    }
    catch(e){
      console.error(e);
    }

    console.log(this.event);
    let idUser:string;
    if(Object.prototype.toString.call(this.event.user) === '[object String]'){
      idUser = this.event.user
    }else{
      idUser = this.event.user.id;
    }

    let userPublisher:any = await this.http.get("/user/"+ idUser).toPromise();  
    this.username = userPublisher.username;

    //for geoconder location
    this.location.change = false;
    this.location.useMap = this.event.location.hasOwnProperty("lat") && this.event.location.hasOwnProperty("lng");
    // console.log(this.location);
    try{

      if( this.location.useMap === true ){
        this.location.position = { lat: this.event.location.lat, lng: this.event.location.lng };
        let places = await this.helper.locationToPlaces(this.location.position);
        if( places === null) return;
        this.location.place = places[0];
        this.location.change = true;
      }else{
        
        if( google ){
          
          let geocoder = new google.maps.Geocoder()
          geocoder.geocode({ address: this.event.location.address }, function(res, status){

            if( res.length === 0 ) return;

            res = res[0];
            if( res.geometry ){
              let lat = res.geometry.location.lat();
              let lot = res.geometry.location.lng();
              let t = this;
              this.zone.run(function(){ t.location.change = true; });
              this.loadMap(lat, lot);
            }

          }.bind(this));
        }

      }

    }
    catch(e){
      console.error(e);
    }
    
    if( moment(this.event.dateTime, "YYYY-MM-DDTHH:mm:ss.SSS[Z]", true).isValid() ){
      this.event.dateTime = moment(this.event.dateTime).format("MM/DD/YYYY hh:mm a");
    }

    this.event.parsedTime = moment(this.event.dateTime, "MM/DD/YYYY hh:mm a").format("Do MMMM YYYY hh:mm a");
    
    this.event.link = '';
    if( this.event.location.hasOwnProperty('link') ){

      if( !this.event.location.link.includes("http") || !this.event.location.link.includes("https") ){
        this.event.link = "http://"+ this.event.location.link;
      }else
        this.event.link = this.event.location.link 

    }

      
      if( this.location.useMap === true ){

        this.load = this.loading.create({
          content: "Loading Map"
        });
        //this.load.present({ disableApp : true });

        this.loadMap(this.event.location.lat, this.event.location.lng);
      }

      let counts = await this.getTrackings(this.event);

      this.event.countYes = counts.countYes;
      this.event.countNo = counts.countNo;
      this.event.countMaybe = counts.countMaybe;
  }

  public successLoadImage(){
    this.loadImage = true;
  }

  //Para obtener los tracking de event
  private async getTrackings(event){
    
    let countYes=0, countNo=0, countMaybe=0;
    try{
      let trackings:any = await this.http.get("/trackingevent/event/"+ event.id).toPromise();

      console.log(trackings);
      await Promise.all( trackings.map( async function(item){

        if( item.info == 'yes' )
          countYes += 1;
        else if( item.info == 'no' )
          countNo += 1;
        else
          countMaybe += 1;

        return item;
      }) );

    }
    catch(e){
      console.error(e);
    }

    return { countYes, countNo, countMaybe };
  }

  loadMap(lat, lot) {
    console.log(lat, lot);
    let mapOptions: GoogleMapOptions = {
      camera: {
        target: {
          lat: lat,
          lng: lot
        },
        zoom: 18,
        tilt: 30
      }
    };

    let t = this;
    this.map = GoogleMaps.create('map_canvas', mapOptions);

    // Wait the MAP_READY before using any methods.
    this.map.one(GoogleMapsEvent.MAP_READY)
      .then(() => {
        console.log('Map is ready!');

        t.load.dismiss();

        // Now you can use all methods safely.
        this.map.addMarker({
            title: 'Position of Event',
            icon: 'blue',
            animation: 'DROP',
            position: {
              lat: lat,
              lng: lot
            }
          })
          .then(marker => {
            marker.on(GoogleMapsEvent.MARKER_CLICK)
              .subscribe(() => {
              });
          });

      });

  }

  public remove(){
    let t = this;
    let alert = this.alertCtrl.create({
      title: 'Confirm Password',
      inputs: [
        {
          name: 'password',
          placeholder: 'Password',
          type: 'password'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Go!',
          handler: data => {
            t.checkPassword(data.password);
          }
        }
      ]
    });
    alert.present();
  }

  public checkPassword(password){
    let username = this.auth.User().username;

    this.load = this.loading.create({ content: "Deleting..." });
    this.load.present({ disableApp : true });
    let t = this;
    this.http.post('/login', { username, password})
    .subscribe(function(data:any){

      if( data.hasOwnProperty("message") && data.message == "User not found" ){
        t.load.dismiss();
        t.alertCtrl.create({
          title: "Error",
          message: "Passwords do not match",
          buttons: ["Ok"]
        }).present();

      }else{

        console.log("success");
        t.deleteEvent();

      }
    }, function(err){
      
      this.load.dismiss();

      t.alertCtrl.create({
        title: "Error",
        message: "Unexpected Error",
        buttons: ["Ok"]
      }).present();

      console.error(err);

    });
  }

  private async deleteEvent(){
    let t = this, valid:boolean=true;
    try{
      await t.http.delete("/event/"+ t.event.id).toPromise();
      await t.http.delete("/locationevent/"+ t.event.location[0].id).toPromise();
      await t.http.delete("/images/events/"+ t.event.id).toPromise();
    }
    catch(e){
      console.error(e);
      valid = false;
      t.load.dismissAll();
      t.alertCtrl.create({
        title: "Error",
        message: "Unexpected Error",
        buttons: ["Ok"]
      }).present();
    }

    if( valid === false )
      return;
    
    t.load.dismiss();
    this.navCtrl.setRoot(EventsSchedulePage);
  }

  private async editEvent(){
    let t = this;
    this.navCtrl.pop({animation: "ios-transition"}, function(){
      t.navCtrl.push(EditEventPage, {
        event: t.event,
        index: t.index
      }, {animation: "ios-transition"});
    })
  }

  public viewPhoto(src:string, name:string){
    console.log(src);
    this.photoViewer.show(src, name, { share: true})
  }

  public async like(event, likeUp){
    
    //si no ha dado like en ninguno
    if( event.likeUp === false && event.likeDown === false){
      let like:any = { user : this.user.id, event : event.id, dateTime : moment().toISOString() };
      if( likeUp === true ){
        like.like = true
      }else{
        like.like = false;
      }

      let li = await this.http.post("/likes/", like).toPromise();
      //console.log(li);
      event.likeUp = likeUp;
      event.likeDown = !likeUp;
      event.likes.push(li);
      await this.countLikes(event);
      return;
    }

    //Para cuando ya se ha dado click en cualquiera de los botones
    let idUser = this.user.id;
    let index = event.likes.findIndex(function(elem){ return elem.user === idUser });
    let like = event.likes[index];

    //console.log(like);

    if(event.likeUp === true && likeUp === true){
      /*let li = */await this.http.delete("/likes/"+ like.id).toPromise();
      event.likeUp = false;
      if( event.likes.length === 1)
        event.likes = [];
      else
        event.likes.splice(index, 1);
      //console.log(event.likes);
      await this.countLikes(event);
      return;

    }else if(event.likeDown === true && likeUp === false ){
      /*let li = */await this.http.delete("/likes/"+ like.id).toPromise();
      event.likeDown = false;
      if( event.likes.length === 1)
        event.likes = [];
      else
        event.likes.splice(index, 1);

      //console.log(event.likes);
      await this.countLikes(event);
      return;
    }
    
    if(event.likeUp === false && likeUp === true && event.likeDown === true){
      /*let li = */await this.http.put("/likes/"+ like.id, like).toPromise();
      //console.log(li);
      event.likeDown = false;
      event.likeUp = true;
      event.likes[index].like = likeUp;
      await this.countLikes(event);
      
    }else if(event.likeUp === true && likeUp === false && event.likeDown === false){
      /*let li = */await this.http.put("/likes/"+ like.id, like).toPromise();
      //console.log(li);
      event.likeDown = true;
      event.likeUp = false;
      event.likes[index].like = likeUp;
      await this.countLikes(event);
    }

  }

  private async countLikes(event):Promise<Object>{
    //let user = this.user;
    return new Promise(function(resolve, reject){
      let likesUp=0, likesDown = 0;
        for(var t of event.likes){
          if( t.like === true ){
            likesUp +=1;
          }else{
            likesDown +=1;
          }
        }
        event.likesUp = likesUp;
        event.likesDown = likesDown;
        resolve(true);
    });
  }

  public async viewTraking(e){
    let view = this.modalCtrl.create(ViewTrakingComponent, { e });
    view.present();
  }

  public viewTrakingEvent(){
    if( MyApp.User.role.name === 'Manager' ){
      this.modalCtrl.create(TrackingEventManagerComponent, { e : this.event }).present();
    }/*else{
      let te = this.modalCtrl.create(TrackingEventComponent, { e : this.event })
      te.present();
      let t = this;
      te.onDidDismiss(async function(){
        let counts = await this.getTrackings(this.event);

        t.event.countYes = counts.countYes;
        t.event.countNo = counts.countNo;
        t.event.countMaybe = counts.countMaybe;
      });
    }*/
    
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

      let counts = await this.getTrackings(this.event);

      this.event.countYes = counts.countYes;
      this.event.countNo = counts.countNo;
      this.event.countMaybe = counts.countMaybe;

    }
    catch(e){
      console.error(e);
    }
  }

}
