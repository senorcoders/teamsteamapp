import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import * as moment from 'moment';
import { DatePicker } from '@ionic-native/date-picker';
import { HttpClient } from '@angular/common/http';
import { MyApp } from '../../app/app.component';
import { MyTaskPage } from '../my-task/my-task';
import { HelpersProvider } from '../../providers/helpers/helpers';

@IonicPage()
@Component({
  selector: 'page-new-task',
  templateUrl: 'new-task.html',
})
export class NewTaskPage {

  public name:string="";
  public description:string="";
  public assign="";
  public date:string;
  public time:string;
  public user=MyApp.User;

  public players:Array<any>=[];

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private datePicker: DatePicker, private alertCtrl: AlertController,
    public http: HttpClient, private helper: HelpersProvider
  ) {
    this.date = moment().format("ddd DD MMM YYYY");
    this.time = moment().format("HH:mm");
  }

  async ngOnInit(){

    let family:any = await this.http.get("/family?where={'team':'"+ MyApp.User.team+ "'}").toPromise();
    let players:any = await this.http.get("/players/team/"+ MyApp.User.team).toPromise();
    let managers:any = await this.http.get("/roles?=where{'team':'"+ MyApp.User.team+ "', name:'Manager'}").toPromise();
    
    //Filtramos para los que no tenga el user
    players = players.concat(managers).concat(family).filter(function(it){
      return it.user !== null && it.user !== undefined;
    });
    //Filtramos para la family que se repite
    family = [];
    for(let p of players){
      let index = family.findIndex(function(it){
        return p.user.id === it.user.id;
      });
      if( index === -1 ){
        family.push(p);
      }
    }

    this.players = family;

  }

  public editDate(){
    this.datePicker.show({
      date: new Date(),
      mode: 'date',
      androidTheme: this.datePicker.ANDROID_THEMES.THEME_HOLO_DARK
    }).then(
      date =>{
        console.log(date);
        this.date = moment(date).format('ddd DD MMM YYYY');
      } ,
      err => console.log('Error occurred while getting date: ', err)
    );
  }

  editTime(){
    this.datePicker.show({
      date: new Date(),
      mode: 'time',
      androidTheme: this.datePicker.ANDROID_THEMES.THEME_HOLO_DARK
    }).then(
      date =>{
        console.log(date);
        this.time = moment(date).format("HH:mm");
      } ,
      err => console.log('Error occurred while getting date: ', err)
    );
  }

  public async save(){

    let requiredM = await this.helper.getWords("REQUIRED");
    let emptyM = await this.helper.getWords("EMPTYFIELDS");

    if(
      this.name === '' || 
      this.description === '' ||
      this.assign === ''
    ){
      this.alertCtrl.create({
        title: requiredM,
        message: emptyM
      }).present();
      return;
    }

    let valid = true;
    try{
      let t = {
        name: this.name,
        text: this.description,
        dateTime: moment(this.date+" "+this.time, "ddd DD MMM YYYY HH:mm").toISOString(),
        team: MyApp.User.team,
        from: MyApp.User.id,
        for: this.assign,
        completad: false
      };

      let task = await this.http.post("/task", t).toPromise();
      console.log(task);
    }
    catch(e){
      console.error(e);
      let unexpectedM = await this.helper.getWords("ERORUNEXC");
      this.alertCtrl.create({ title: "Error", message:  unexpectedM })
      .present();
      valid = false;
    }

    if( valid === true ) this.navCtrl.setRoot(MyTaskPage);
  }

}
