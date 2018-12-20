import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ModalController } from 'ionic-angular';
import * as moment from 'moment';
import { HttpClient } from '@angular/common/http';
import { MyApp } from '../../app/app.component';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { SelectEventPage } from '../select-event/select-event';

@IonicPage()
@Component({
  selector: 'page-new-task',
  templateUrl: 'new-task.html',
})
export class NewTaskPage {

  public static __name = "NewTaskPage"


  public name: string = "";
  public description: string = "";
  public assign = "";
  public date: string;
  public time: string;
  public user = MyApp.User;

  public players: Array<any> = [];

  public event: any = {};

  public eventID = "";
  public events = [];

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private alertCtrl: AlertController, public http: HttpClient, 
    private helper: HelpersProvider, public modalCtrl: ModalController
  ) {
    this.date = moment().format("ddd DD MMM YYYY");
    this.time = moment().format("HH:mm");
  }

  async ngOnInit() {

    //Para obtener los eventos
    this.events = await this.http.get("/event/team/upcoming/" + moment().format("MM-DD-YYYY-hh:mm") + "/" + MyApp.User.team).toPromise() as any[];

    let family: any = await this.http.get('/family?where={"team":"' + MyApp.User.team + '"}').toPromise();
    let players: any = await this.http.get("/players/team/" + MyApp.User.team).toPromise();
    let managers: any = await this.http.get('/roles?where={"team":"' + MyApp.User.team + '", "name":"Manager"}').toPromise();

    //Filtramos para los que no tenga el user
    players = players.concat(managers).concat(family).filter(function (it) {
      return it.user !== null && it.user !== undefined;
    });
    //Filtramos para la family que se repite
    family = [];
    for (let p of players) {
      let index = family.findIndex(function (it) {
        return p.user.id === it.user.id;
      });
      if (index === -1) {
        family.push(p);
      }
    }
    //Quitamos el actual usuario en el app
    family = family.filter(it=>{ console.log(it.user.id, MyApp.User.id);
      return it.user.id !== MyApp.User.id;
    });

    this.players = family;

  }

  public assingEvent() {
    let select = this.modalCtrl.create(SelectEventPage);
    select.onDidDismiss(function (event) {
      if (event) {
        this.event = event;
      }
    }.bind(this));
    select.present();
  }

  public removeEvent() {
    this.event = {};
  }

  public existsEvent() {
    return this.event.hasOwnProperty("id");
  }

  public editDate() {
    this.helper.nativeDatePicker()
      .then(date => {
        this.date = moment(date).format("ddd DD MMM YYYY");
      });
  }

  editTime() {
    this.helper.pickerDateTime(true)
      .then(date => {
        this.time = date;
      });
  }

  public async save() {

    let _valid = HelpersProvider.me.validadorFields(this, [
      { value: this.name, type: "text", nameMessage: "NAME" },
      { value: this.assign, type: "text", nameMessage: "ASSIGN" }
    ]);
    if (_valid.valid === false) {
      return;
    }

    let valid = true;
    try {
      let t: any = {
        name: this.name,
        text: this.description,
        dateTime: moment(this.date + " " + this.time, "ddd DD MMM YYYY hh:mm a").toISOString(),
        team: MyApp.User.team,
        from: MyApp.User.id,
        for: this.assign,
        completad: false
      };

      if (this.eventID !== "") {
        t.event = this.eventID;
      }

      let task = await this.http.post("/task", t).toPromise();
      console.log(task);
    }
    catch (e) {
      console.error(e);
      let unexpectedM = await this.helper.getWords("ERORUNEXC");
      this.alertCtrl.create({ title: "Error", message: unexpectedM })
        .present();
      valid = false;
    }

    if (valid === true) this.navCtrl.pop();
  }

}
