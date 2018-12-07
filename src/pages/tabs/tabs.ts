import { Component, NgZone, ViewChild, isDevMode } from '@angular/core';
import { IonicPage, NavController, NavParams, Tabs, Platform, ViewController, Tab } from 'ionic-angular';
import { EventsSchedulePage } from '../events-schedule/events-schedule';
import { RosterPage } from '../roster/roster';
import { ListChatsPage } from '../list-chats/list-chats';
import { PhotosPage } from '../photos/photos';
import { ViewProfilePage } from '../view-profile/view-profile';
import { MyApp } from '../../app/app.component';
import { TeamsLeaguePage } from '../teams-league/teams-league';
import { AgentFreePage } from '../agent-free/agent-free';
import { PlacesPlayerFreePage } from '../places-player-free/places-player-free';
import { OwnerLeaguesPage } from '../owner-leagues/owner-leagues';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment';

@IonicPage()
@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html',
})
export class TabsPage {

  @ViewChild('myTabs') tabRef: Tabs;

  public pages = [
    { id: 1, title: "NAVMENU.EVENTS", component: EventsSchedulePage, icon: "custom-events", role: { not: "FreeAgent", yes: "*" }, watch: "", newData: "" },
    { id: 2, title: "NAVMENU.ROSTER", component: RosterPage, icon: "custom-roster", role: { not: "FreeAgent|OwnerLeague", yes: "*" }, watch: "", newData: "" },
    { id: 3, title: "PHOTOS.TITLE", component: PhotosPage, icon: "custom-photos", role: { not: "FreeAgent|OwnerLeague", yes: "*" }, watch: "", newData: "" },
    { id: 4, title: "NAVMENU.MESSAGES", component: ListChatsPage, icon: "custom-chat", role: { not: "FreeAgent", yes: "*" }, watch: "chat", newData: "" },
    // { title: "NAVMENU.MYTASK", component: MyTaskPage, icon: "tasks.png", role: { not: "FreeAgent|OwnerLeague|Manager|Family", yes: "*" }, watch: "", newData: "" },
    { id: 5, title: "LEAGUE.TEAMS.TITLE", component: TeamsLeaguePage, icon: "custom-add-team", role: "OwnerLeague", watch: "", newData: "" },
    { id: 10, title: "OWNERS", component: OwnerLeaguesPage, icon: "ios-people", role: "OwnerLeague", watch: "", newData: "" },
    // { id: 6, title: "NOTIFCATION.TITLE", component: NotificationPage, icon: "custom-request", role: { not: "FreeAgent|OwnerLeague", yes: "Manager" }, watch: "", newData: "" },
    // { title: "REQUESTS", component: ViewRequestsPage, icon: "request-icon.svg", role: { not: "FreeAgent|OwnerLeague", yes: "Manager" }, watch: "request", newData: "request" },
    // { title: "REQUESTSTEAM", component: RequestsPlayerPage, icon: "request-icon.svg", role: "*", watch: "requestPlayer", newData: "requestPlayer" },
    // { title: "REQUESTLEAGUE.NAME", component: RequestsLeaguePage, icon: "request-icon.svg", role: "Manager", watch: "requestLeague", newData: "requestLeague" },
    { id: 7, title: "AGENTFREE.TITLE", component: AgentFreePage, icon: "custom-nearby-events", role: "FreeAgent", watch: "", newData: "" },
    { id: 8, title: "PLACES.TITLE", component: PlacesPlayerFreePage, icon: "custom-events-places", role: "FreeAgent", watch: "", newData: "" },
    { id: 9, title: "MORE", component: ViewProfilePage, icon: "ios-more", role: "*", watch: "", newData: "" }
  ];
  public newDataSchema = [
    { id: 'request', role: 'Manager' },
    { id: 'chat', role: '*' },
    { id: 'requestPlayer', role: 'FreeAgent' },
    { id: "requestLeague", role: "Manager" }
  ];

  public enableMenu = true;

  public static reloadMenu: Function = () => { };

  constructor(
    public navCtrl: NavController, public navParams: NavParams,
    public zone: NgZone, private http: HttpClient,
    private platform: Platform
  ) {
    TabsPage.reloadMenu = this.reloadMenu.bind(this);
  }

  async ionViewDidLoad() {
    this.tabRef.ionChange.subscribe(this.proccessOnChangeRoot.bind(this));
  }

  private proccessOnChangeRoot(tab:Tab){
    let page = tab.root;
    try {
      if (MyApp.User === null || MyApp.User === undefined) return;

      if (
        this.platform.is('cordova') &&
        page.hasOwnProperty("__name") === true
        && isDevMode() === false
        ) {

        let screen: any = {
          startTime: new Date().toISOString(),
          screen: page.__name,
          firstName: MyApp.User.firstName,
          lastName: MyApp.User.lastName,
          userEmail: MyApp.User.email,
          platform: this.platform.is("ios") ? 'ios' : 'android'
        };

        if (MyApp.User.team !== undefined && MyApp.User.team !== null) {
          screen.team = MyApp.User.team
        } else if (MyApp.User.role.league !== undefined && MyApp.User.role.league !== null) {
          if (Object.prototype.toString.call(MyApp.User.role.league) === "[object Object]")
            screen.league = MyApp.User.role.league.id;
          else
            screen.league = MyApp.User.role.league.id;
        }

        tab._views[0].willLeave.subscribe(async () => {
          // console.log("will leave root", page.__name);
          try {
            screen.endTime = new Date().toISOString();

            //Calculamos el tiempo que estuvo en la pantalla en segundos
            let dateTime = moment(screen.startTime),
              dateTimeEnd = moment(screen.endTime);
            let diff = moment.duration(dateTime.diff(dateTimeEnd));
            screen.timeVisited = Math.abs(diff.seconds());

            await this.http.post("/screen", screen).toPromise();
          }
          catch (e) {
            console.error(e);
          }
        });
      }
    }
    catch (e) {
      console.error(e);
    }

    tab.viewDidLoad.subscribe(this.proccessViewInRoot.bind(this));
  }

  private proccessViewInRoot(data: ViewController) {
    // console.log("change page", data);
    try {
      if (MyApp.User === null || MyApp.User === undefined) return;

      if (
        this.platform.is('cordova') &&
        data.component.hasOwnProperty("__name") === true 
        && isDevMode() === false
        ) {

        let screen: any = {
          startTime: new Date().toISOString(),
          screen: data.component.__name,
          firstName: MyApp.User.firstName,
          lastName: MyApp.User.lastName,
          userEmail: MyApp.User.email,
          platform: this.platform.is("ios") ? 'ios' : 'android'
        };

        if (MyApp.User.team !== undefined && MyApp.User.team !== null) {
          screen.team = MyApp.User.team
        } else if (MyApp.User.role.league !== undefined && MyApp.User.role.league !== null) {
          if (Object.prototype.toString.call(MyApp.User.role.league) === "[object Object]")
            screen.league = MyApp.User.role.league.id;
          else
            screen.league = MyApp.User.role.league.id;
        }

        data.didLeave.subscribe(async () => { 
          // console.log("onDidDismiss", screen);
          try {
            screen.endTime = new Date().toISOString();

            //Calculamos el tiempo que estuvo en la pantalla en segundos
            let dateTime = moment(screen.startTime),
              dateTimeEnd = moment(screen.endTime);
            let diff = moment.duration(dateTime.diff(dateTimeEnd));
            screen.timeVisited = Math.abs(diff.seconds());

            await this.http.post("/screen", screen).toPromise();
          }
          catch (e) {
            console.error(e);
          }
        });
      }
    }
    catch (e) {
      console.error(e);
    }
  }

  public returnPageComponents(id: number) {
    return this.pages.find(it => {
      return it.id === id;
    });
  }

  public validPage(id: number) {
    let page = this.pages.find(it => {
      return it.id === id;
    });

    if (page !== undefined) return this.validRolePage(page, page.newData);

    return true;
  }

  public validRolePage(page, newDatas) {

    let valid = MyApp.User === undefined || MyApp.User === null;

    if (valid === true) {
      return false;
    }

    //El usuario puede estar sin ningun rol
    //cuando es asi no se muestra ningun item en el nav
    if (MyApp.User.role === null || MyApp.User.role === undefined) return false;

    //Para verificar si nesesita de newData, para mostrarse
    newDatas = newDatas || 'not';
    if (newDatas !== 'not') {
      if (this.newData(newDatas) === true) {
        return false;
      }
    }

    if (page.role === "*") return true;

    if (Object.prototype.toString.call(page.role) === "[object String]")
      return MyApp.User.role.name === page.role;

    if (Object.prototype.toString.call(page.role) === "[object Object]") {

      //Para multitples roles en not
      if (page.role.not.includes("|")) {
        let validFast = true;
        let nots = page.role.not.split("|");
        for (let n of nots) {
          if (n === MyApp.User.role.name) {
            validFast = false;
          }
        }

        return validFast;
      }

      //Para multitples roles en yes
      if (page.role.yes.includes("|")) {
        let validFast = false;
        let yess = page.role.yes.split("|");
        for (let s of yess) {
          if (s === MyApp.User.role.name) {
            validFast = true;
          }
        }

        return validFast;
      }

      if (page.role.not === MyApp.User.role.name)
        return false;
      else if (page.role.yes === MyApp.User.role.name)
        return true;
      else if (page.role.yes === "*") {
        return true;
      }
    }
  }

  public newData(id): boolean {
    if (MyApp.User === null || MyApp.User === undefined) return true;

    if (Object.prototype.toString.call(id) === '[object Array]') {

      let valid = false;
      for (let i of id) {
        if (MyApp.newDatas.hasOwnProperty(i.id)) {
          if (MyApp.newDatas[i.id] === true && (i.role === MyApp.User.role.name || i.role === '*')) {
            valid = true;
          }
        }
      }
      return !valid;
    }

    if (MyApp.newDatas.hasOwnProperty(id))
      return !MyApp.newDatas[id];

    return !false;
  }

  private reloadMenu() {
    this.enableMenu = false;
    this.zone.run(() => { console.log("updated menu init"); })
    return new Promise(resolve => {
      setTimeout(function () {
        this.enableMenu = true;
        this.zone.run(() => { console.log("updated menu finish"); });
        resolve();
      }.bind(this), 400);
    })
  }

}
