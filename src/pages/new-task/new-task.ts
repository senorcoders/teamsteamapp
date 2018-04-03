import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import * as moment from 'moment';
import { DatePicker } from '@ionic-native/date-picker';
import { HttpClient } from '@angular/common/http';
import { MyApp } from '../../app/app.component';
import { MyTaskPage } from '../my-task/my-task';

@IonicPage()
@Component({
  selector: 'page-new-task',
  templateUrl: 'new-task.html',
})
export class NewTaskPage {

  public name:string="";
  public description:string="";
  public date:string;
  public time:string;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private datePicker: DatePicker, private alertCtrl: AlertController,
    public http: HttpClient
  ) {
    this.date = moment().format("ddd DD MMM YYYY");
    this.time = moment().format("HH:mm");
  }

  ngOnInit(){

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
    if(
      this.name === '' || 
      this.description === ''
    ){
      this.alertCtrl.create({
        title: "Required!",
        message: "Empty Fields"
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
        user: MyApp.User.id,
        completad: false
      };

      let task = await this.http.post("/task", t).toPromise();
      console.log(task);
    }
    catch(e){
      console.error(e);
      this.alertCtrl.create({ title: "Error", message: "Unexpected Error"})
      .present();
      valid = false;
    }

    if( valid === true ) this.navCtrl.setRoot(MyTaskPage);
  }

}
