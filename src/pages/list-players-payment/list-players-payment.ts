import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ModalController } from 'ionic-angular';
import { MyApp } from '../../app/app.component';
import { interceptor } from '../../providers/auth-service/interceptor';
import { HttpClient } from '@angular/common/http';
import { AsignPaymentPage } from '../asign-payment/asign-payment';
import { AsingpaymentComponent } from '../../components/asingpayment/asingpayment';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { WebSocketsProvider } from '../../providers/web-sockets/web-sockets';


@IonicPage()
@Component({
  selector: 'page-list-players-payment',
  templateUrl: 'list-players-payment.html',
})
export class ListPlayersPaymentPage {

  public static __name = "ListPlayersPaymentPage"

  public user: any = {};
  public players = [];
  public multi = false;
  private down = false;
  public emailPaypal = "";
  public role: any = { emailPaypal: "" };
  private playersSelects: Array<any> = [];

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public loading: LoadingController, public http: HttpClient,
    public modelCtrl: ModalController, public zone: NgZone,
    private helper: HelpersProvider, private inb: InAppBrowser,
    private socket: WebSocketsProvider
  ) {

  }


  async ionViewWillEnter() {

    let load = this.helper.getLoadingStandar();

    this.user = MyApp.User;
    try {
      //Obtenemos el role para saber su email y si concedio los permisos para crear facturas
      this.role = await this.http.get("/roles/" + this.user.role.id).toPromise();
      if (!this.role.hasOwnProperty("emailPaypal"))
        this.role.emailPaypal = "";
      else
        this.emailPaypal = this.role.emailPaypal;

      this.players = await this.http.get("/players/payments/" + this.user.team).toPromise() as any[];

      this.players = this.players.map(function (item) {
        item.select = false;
        item.loadImage = false;
        item.image = interceptor.transformUrl("/userprofile/images/" + item.user.id + "/" + MyApp.User.team);
        item.debe = this.calcDebe(item);
        return item;
      }.bind(this));

    }
    catch (e) {
      console.error(e);
    }
    load.dismiss();

  }

  public validChange() {
    return this.emailPaypal !== this.role.emailPaypal && HelpersProvider.me.validEmail(this.emailPaypal);
  }

  public validEmailPaypal() {
    if (this.validChange() === true)
      return false;

    return !this.role.hasOwnProperty("emailPaypal") || this.role.emailPaypal === "";
  }

  public validPermission(): boolean {

    if (this.validEmailPaypal() === true || this.validChange() === true)
      return false;

    if (!this.role.hasOwnProperty("requirePermission"))
      return true;

    return this.role.requirePermission;
  }

  public success(event, player) {
    player.loadImage = true;
  }

  public async updateEmailPaypal() {
    let load = HelpersProvider.me.getLoadingStandar();
    try {
      let role = await this.http.put("/email-paypal", { role: this.role.id, email: this.emailPaypal }).toPromise();
      this.role = role;
      if (!this.role.hasOwnProperty("emailPaypal"))
        this.role.emailPaypal = "";
      else
        this.emailPaypal = this.role.emailPaypal;
    }
    catch (e) {
      console.error(e);
      HelpersProvider.me.presentAlertErrorStandar();
    }
    load.dismiss();
  }

  public viewPlayer(member) {
    this.navCtrl.push(AsignPaymentPage, {
      player: member
    });
  }

  public multiSelect() {
    console.log("enter", this.multi);
    this.multi = !this.multi;
    console.log(this.multi);
  }

  public pressed(member) {

    //let multi = JSON.parse( JSON.stringify({ m : this.multi }) ).m;
    this.down = true;

    setTimeout(function () {

      if (this.down === false && this.multi === false) {
        this.viewPlayer(member);

      } else if (this.down === false && this.multi === true) {

        member.select = !member.select;
        if (member.select === true) {
          this.playersSelects.push(member);
        } else {
          let index = this.playersSelects.findIndex(function (it) { return it.id === member.id; });
          //console.log(index, this.playersSelects);
          if (index !== -1) {

            if (this.playersSelects.length === 1)
              this.playersSelects = [];
            else
              this.playersSelects.splice(index, 1);
          }
        }

      } else {
        this.multi = !this.multi;

        if (this.multi === false) {
          this.players = this.players.map(function (item) {
            item.select = false;
            return item;
          });
          this.playersSelects = [];
        } else {
          member.select = true;
          this.playersSelects.push(member);
        }

      }

    }.bind(this), 500);
  }

  public active() {
    console.log("active " + new Date().getTime());
  }

  public deactive() {
    this.down = false;
  }

  public multiPayment() {

    this.navCtrl.push(AsingpaymentComponent, {
      players: this.playersSelects
    });

    this.playersSelects = [];

  }

  public async confirmPermission() {
    let load = HelpersProvider.me.getLoadingStandar();
    try {
      let data = await this.http.get(`/token-request/permission/${this.role.id}`).toPromise() as any;
      //Nos subscribimos a websocket
      //Para cuando se actualizen los permisos
      this.socket.subscribe("permission-upgrade-updated-"+ this.role.id, this.ionViewWillEnter.bind(this));
      let window = this.inb.create(data.url);
      window.show();
    }
    catch (e) {
      console.error(e);
      HelpersProvider.me.presentAlertErrorStandar();
    }
    load.dismiss();
  }

  private calcDebe(player) {

    if (!player.hasOwnProperty("payments")) {
      return 0;
    }

    let suma = 0;
    for (var pay of player.payments) {
      if (!pay.hasOwnProperty("invoice_paid"))
        suma += Number(pay.quantity);
    }

    return suma;
  }

  public selectAll() {

    this.playersSelects = [];
    this.players = this.players.map(function (item) {
      this.playersSelects.push(item);
      item.select = true;
      return item;
    }.bind(this));

    console.log(this.players);

  }

}
