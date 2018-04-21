import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { Storage } from '@ionic/storage';
import { MenuController } from 'ionic-angular';
import { MyApp } from '../../app/app.component';
import { HelpersProvider } from '../helpers/helpers';

/**
 * Para manejar la session del usuario y guardar datos importantes
 */

//#region Class of User
class User {
  public id:String;
  public username:String;
  public email:String;
  public firstName:string;
  public lastName:String;
  public team:string;
  public token:string;
  public role:Object={
    name:""
  };

}

@Injectable()
export class AuthServiceProvider {

  private user:User= new User();
  public functions:any=function(){};

  constructor(public http: HttpClient, public storage: Storage, 
    public menuCtrl: MenuController, public zone: NgZone,
    public helper: HelpersProvider
   ) {

  }

  /**
   * Login
   */
  public async Login(email:String, password:String, callback:Function) {

    try{

      let data:any = await this.http.post('/login', { email, password}).toPromise()

      this.menuCtrl.swipeEnable(true);
  
      if( data.hasOwnProperty("message") ){
        callback(data, null);
      }else{

        //For save
        await this.storage.set('user', data);
        this.user = new User();
        this.user.id = data.id;
        this.user.username = data.username;
        this.user.firstName = data.firstName;
        this.user.lastName = data.lastName;
        this.user.email = data.email;
        this.user.role = data.role;
        this.user.token = data.token;

        this.SaveTeam(function(){
          callback(null, data);
        });

      }
    }
    catch(err){
      console.log(err);
      callback(null, null);
    }
    
  }
  
  //guardar el team del usuario para evitar estar cargando del servidor el equipo
  public async SaveTeam(callback:Function){
    let user;

    try{
      
      user = this.User();
      MyApp.User = user;

      //ahora asignamos el lenaguaje si es que esta definido
      if( user.hasOwnProperty('options') && user.options.hasOwnProperty('language') ){
        console.log("asignamos language", user.options.language);
        await this.helper.setLanguage(user.options.language);
      }else{
        await this.helper.setLanguage('en')
      }
      
      let url;
      if( user.role.name === "Player"){
        url = "/team/player/"+ user.id;
      }else if( user.role.name === "Manager" ){
        url = "/team/manager/"+ user.id;
      }else if( user.role.name === "Family" ){
        url = "/team/family/"+ user.id;
      }
      
      var res = await this.http.get(url).toPromise();

      let team:any = res;

      let events:any;

      if( res.hasOwnProperty("child") ){
        team = team.child.team;
      }else if( team.hasOwnProperty('team') ){
        team = team.team;
      }else if( Object.prototype.toString.call(team) === '[object Array]'){
        team = team[0].team;
      }

      console.log("team "+ team);
      this.user.team = team;
      MyApp.User = this.user;
      await this.storage.set("team", team);
      
      //Para actualizar el nombre del equipo en menu slide
      let t:any = await this.http.get("/teams/"+ MyApp.User.team).toPromise();
      document.getElementById("nameTeam").innerHTML = t.name;
      
      this.changesUpdate();
      callback();
    }catch(e){
      console.error(e);
      callback();
    }

  }

  public async updateTokenReg(token){
    console.log(token);
    let updated = await this.http.put("/user/"+ MyApp.User.id, { "tokenReg": token }).toPromise()
    console.log(updated);
  }

  //comprobar si ya un usuario guardado
  public async checkUser(){
    let user = await this.storage.get("user");
    let team = await this.storage.get("team");

    this.user = user;
    if(user != null){
      this.user.team = team;
      MyApp.User = this.user;
      this.menuCtrl.swipeEnable(true);
      return true;
    }

    this.menuCtrl.swipeEnable(false);
    return false;
  }

  //de volver la instancia del usuario actual
  public User(){
    return this.user;
  }

  //Obtener el nombre completo del usuario
  public fullName(){
    return this.user.firstName+ " "+ this.user.lastName;
  }

  public async logout(){
    this.menuCtrl.swipeEnable(false);
    var data = await this.storage.remove("user");
    data = await this.storage.remove("team");
    this.user = null;
    delete MyApp.User;
    return data === undefined;
  }

  private changesUpdate(){
    this.functions();
  }

  //esto es para actualizar datos en el app para cuando se cambie de usuario
  public changeUser(callback:any){
    this.functions = callback;
  }

  //para guardar cambios hechos en options del usuario
  public async updateUser(user:any){
    
    let token = MyApp.User.token;
    let team = MyApp.User.team;
    user.token = token;
    user.team = team;
    await this.storage.set("user", user);
    MyApp.User = user;
    this.user = MyApp.User;
    
  }

  //para guardar cambios hechos en options del usuario
  public async saveOptions(options:any){
    let user = MyApp.User;
    user.options = options;
    await this.storage.set("user", user);
    MyApp.User = user;
    this.user = MyApp.User;
  }

  public async updateTeam(id:string){

    await this.storage.set("team", id);
    MyApp.User.team = id;
    this.user.team = id;

  }

}
