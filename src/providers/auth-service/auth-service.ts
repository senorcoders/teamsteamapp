import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { Storage } from '@ionic/storage';
import { MenuController, Platform } from 'ionic-angular';
import { MyApp } from '../../app/app.component';
import { HelpersProvider } from '../helpers/helpers';
import { Globalization } from '@ionic-native/globalization';

/**
 * Para manejar la session del usuario y guardar datos importantes
 */

//#region Class of User

@Injectable()
export class AuthServiceProvider {

  private user: any = {};
  public functions: any = function () { };

  constructor(public http: HttpClient, public storage: Storage,
    public menuCtrl: MenuController, public zone: NgZone,
    public helper: HelpersProvider, public platform: Platform,
    public globalization: Globalization
  ) {

  }

  /**
   * Login
   */
  public async Login(email: String, callback: Function) {

    try {
      let info: any = this.helper.getDeviceInfo();
      info.email = email;

      let data: any = await this.http.post('/login', info).toPromise()

      this.menuCtrl.swipeEnable(true);

      if (data.hasOwnProperty("message")) {
        callback(data, null);
      } else if (data.hasOwnProperty("verify")) {
        callback(data, null);
      } else {

        //For save

        //guardamos el wheaterApi
        let apiKey = data.wheaterApiKey;
        delete data.wheaterApiKey;
        await this.storage.set("apiKey", apiKey);
        HelpersProvider.me.wheaterApiKey = apiKey;

        data.tokenReady = false;
        await this.storage.set('user', data);
        this.user = data;
        this.user.tokenReg = data.tokenReg || [];

        //ahora asignamos el lenaguaje si es que esta definido
        if (this.user.hasOwnProperty('options') && this.user.options.hasOwnProperty('language')) {
          await this.helper.setLanguage(this.user.options.language);
        } else {
          await this.helper.setLanguage('en');
        }

        //console.log(this.user);

        this.saveRole(function () {
          callback(null, data);
        });

      }
    }
    catch (err) {
      console.log(err);
      callback(null, null);
    }

  }

  public async setTimeZoneTeam() {
    if (MyApp.User.role.name === "Manager") {
      let times = await this.globalization.getDatePattern({ formatLength: "", selector: "" });
      if (times.hasOwnProperty("iana_timezone")) {
        let timeZone = times.iana_timezone;
        await this.http.put("/teams/" + MyApp.User.team, { timeZone }).toPromise();
      }
    }
  }

  //guardar el team del usuario para evitar estar cargando del servidor el equipo
  public async saveRole(callback: Function) {
    let user;

    try {

      user = this.User();
      MyApp.User = user;
      MyApp.User.role = user.roles[0];

      await this.storage.set("role", MyApp.User.role);

      /********
       * Se tiene que guardar el time zone del equipo para
       * cuando se quiera obtener los eventos proximos dentro de 15 minutos
       * el time zona es para que la busquedad se haga correctamente, obteniendo el tiempo
       * que debe de ser segun su zona horaria
       */
      if (MyApp.User.role.hasOwnProperty("team")) {
        MyApp.User.team = user.roles[0].team.id;
        await this.setTimeZoneTeam();
      }

    } catch (e) {
      console.error(e);
    }
    finally {
      let t = this;
      this.zone.run(function () { t.changesUpdate(); });
      callback();
    }

  }

  public async updateTokenReg(token) {
    try {

      let tokens = [];
      if (MyApp.User.hasOwnProperty("tokenReg") && Object.prototype.toString.call(MyApp.User.tokenReg) === '[object Array]') {
        tokens = MyApp.User.tokenReg;
      }
      tokens.push(token);
      console.log(tokens);
      let updated = await this.http.put("/user/" + MyApp.User.id, { "tokenReg": tokens, tokenReady: false }).toPromise()
      console.log(updated);
      let user = MyApp.User;
      user.tokenReg = token;
      user.tokenReady = true;
      await this.updateUser(user);

    }
    catch (e) {
      console.error(e);
    }
  }

  //comprobar si ya un usuario guardado
  public async checkUser() {
    let user = await this.storage.get("user");
    let role = await this.storage.get("role");

    this.user = user;
    if (user != null) {
      MyApp.User = user;
      MyApp.User.role = role;
      if (MyApp.User.role !== undefined && MyApp.User.role !== null) {
        if (MyApp.User.role.hasOwnProperty("team")) {
          MyApp.User.team = role.team.id;
        }
      }
      this.menuCtrl.swipeEnable(true);
      return true;
    }

    this.menuCtrl.swipeEnable(false);
    return false;
  }

  //de volver la instancia del usuario actual
  public User() {
    return this.user;
  }


  public async logout() {
    this.menuCtrl.swipeEnable(false);

    //nos desubscribimos de las notifications push
    if (this.platform.is("cordova")) {
      if (MyApp.me.pushObject !== undefined) {
        await MyApp.me.pushObject.unregister();
        if (MyApp.User.role.hasOwnProperty("team")) {

          await MyApp.me.pushObject.unsubscribe(MyApp.User.team);
        }
      }

      let success = await this.http.post("/logout", { email: MyApp.User.email, token: MyApp.User.tokenReg }).toPromise();
      console.log(success);
      await HelpersProvider.me.backgroundGeolocation.stop();
    }
    this.storage.remove('firstTime');
    this.storage.remove('firstTimeRoster');

    var data = await this.storage.remove("user");
    data = await this.storage.remove("role");
    data = await this.storage.remove("apiKey");
    HelpersProvider.me.wheaterApiKey = "";
    this.user = null;
    delete MyApp.User;

    return data === undefined;
  }

  public changesUpdate() {
    this.functions();
  }

  //esto es para actualizar datos en el app para cuando se cambie de usuario
  public changeUser(callback: any) {
    this.functions = callback;
  }

  //para guardar cambios hechos en options del usuario
  public async updateUser(user: any) {

    let token = MyApp.User.token;
    if (MyApp.User.role.hasOwnProperty("team")) {
      let team = MyApp.User.team;
      user.team = team;
    }

    let role = MyApp.User.role;
    user.token = token;
    user.role = role;
    await this.storage.set("user", user);
    MyApp.User = user;
    this.user = MyApp.User;
    this.changesUpdate();
  }

  //para guardar cambios hechos en options del usuario
  public async saveOptions(options: any) {
    let user = MyApp.User;
    user.options = options;
    await this.storage.set("user", user);
    MyApp.User = user;
    this.user = MyApp.User;
  }

  public async fetchAndUpdateRoles() {
    try {
      let roles = await this.http.get(`/roles?where={"user":"${MyApp.User.id}"}`).toPromise();
      MyApp.User.roles = roles;
      await this.storage.set("user", MyApp.User);
    }
    catch (e) {
      console.error(e);
    }
  }

  public async updateRole(role) {

    await this.storage.set("role", role);
    MyApp.User.role = role;

    try {
      if (role.hasOwnProperty("team")) {
        MyApp.User.team = role.team.id;
        this.user.team = role.team.id;
        //await MyApp.notifcations(MyApp.User.team);
      }

      // if (role.name === "FreeAgent") {
      //   await MyApp.me.pushObject.unregister();
      //   if (MyApp.User.role.hasOwnProperty("team")) {
      //     //await MyApp.me.pushObject.unsubscribe(MyApp.User.team);
      //   }
      //   //Quitamos el tokenReg
      //   if (MyApp.User.tokenReg !== undefined || MyApp.User.tokenReg !== null) {
      //     let success = await this.http.post("/logout", { email: MyApp.User.email, token: MyApp.User.tokenReg }).toPromise();
      //     console.log(success);
      //   }
      //   delete MyApp.User.team;
      // }

      this.changesUpdate();
    }
    catch (e) {
      console.error(e);
    }

  }

}
