import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, Loading, AlertController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';

/**
 * Generated class for the EditFamilyPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-edit-family',
  templateUrl: 'edit-family.html',
})
export class EditFamilyPage {

  public player:any;

  public person1:any={
    id:"",
    idUser: "",
    lastName : "",
    firstName: "",
    email: "",
    relationship: "",
    private: false,
    receiveEmail: true,
    phoneNumber: "",
    address: ""
  };

  public person2:any={
    id: "",
    lastName : "",
    firstName: "",
    email: "",
    relationship: "",
    private: false,
    receiveEmail: true,
    phoneNumber: "",
    address: ""
  };

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient, public loading: LoadingController,
    public alertCtrl: AlertController
  ) {
    this.player = this.navParams.get("player");
  }

  async ngOnInit(){

    let load = this.loading.create({
      content: "Loading..."
    });
    load.present({ disableApp : true });

    this.player = await this.http.get("/players/"+ this.player.id).toPromise();
    console.log(this.player);

    let person1:any, person2:any;

    if(this.player.family.length >= 1 ){
      person1 = await this.http.get("/family/"+ this.player.family[0].id).toPromise();
      this.person1.id = person1.id;
      this.person1.idUser = person1.user.id;
      this.person1.firstName = person1.user.firstName;
      this.person1.lastName = person1.user.lastName;
      this.person1.email = person1.user.email;
      this.person1.relationship = person1.relationship;
      this.person1.private = person1.private;
      this.person1.receiveEmail = person1.receiveEmail;
      this.person1.phoneNumber = person1.phoneNumber;
      this.person1.address = person1.address;
    }

    if(this.player.family.length == 2){
      person2 = await this.http.get("/family/"+ this.player.family[1].id).toPromise();
      this.person2.id = person2.id;
      this.person2.idUser = person2.user.id;
      this.person2.firstName = person2.user.firstName;
      this.person2.lastName = person2.user.lastName;
      this.person2.email = person2.user.email;
      this.person2.relationship = person2.relationship;
      this.person2.private = person2.private;
      this.person2.receiveEmail = person2.receiveEmail;
      this.person2.phoneNumber = person2.phoneNumber;
      this.person2.address = person2.address;
    }
    
    load.dismiss();
  }

  ionViewDidLoad() {
    
  }
  
  public async save(){

    let load:Loading = this.loading.create({ content: "Updating..."});
    load.present({ disableApp : true });

    try{
      let savePerson1:boolean=true, savePerson2:boolean=true;
      if( this.person1.id != "" ){
        savePerson1 = false;
        await this.update(1);
      }
      
      if( this.person2.id != "" ){
        savePerson2 = false;
        await this.update(2);
      }

      let person:any={};

      if( savePerson1 === true
        && this.person1.firstName != "" 
        && this.person1.lastName != ""
        && this.person1.email != ""
      ){

        //save on user
        person.firstName = this.person1.firstName;
        person.lastName = this.person1.lastName;
        person.email = this.person1.email;
        let user:any = await this.http.post("/user/family"+ this.person1.idUser, person).toPromise();

        //save in family
        person = new Object();
        person.user = user.id;
        person.child = this.player.id;
        person.relationship = this.person1.relationship;
        person.private = this.person1.private;
        person.receiveEmail = this.person1.receiveEmail;
        person.phoneNumber = this.person1.phoneNumber;
        person.address = this.person1.address;
        await this.http.post("/family/"+ this.person1.id, person).toPromise();

      }

      console.log(this.person2);

      if( savePerson2 === true
        && this.person2.firstName != "" 
        && this.person2.lastName != ""
        && this.person2.email != ""
      ){

        person = new Object();

        //save on user
        person.firstName = this.person2.firstName;
        person.lastName = this.person2.lastName;
        person.email = this.person2.email;
        let user:any = await this.http.post("/user/family", person).toPromise();

        //save in family
        person = new Object();
        person.user = user.id;
        person.child = this.player.id;
        person.relationship = this.person2.relationship;
        person.private = this.person2.private;
        person.receiveEmail = this.person2.receiveEmail;
        person.phoneNumber = this.person2.phoneNumber;
        person.address = this.person2.address;
        await this.http.post("/family", person).toPromise();

      }
    }
    catch(e){
      console.error(e);
      load.dismiss();
      this.alertCtrl.create({
        title : "Error",
        message: "There was an error while updating",
        buttons: ["Ok"]
      }).present();
    }

    load.dismiss();

    this.navCtrl.pop();

  }

  private async update(num:number){
    let person:any={};

    if(num == 1){

      //update on user
      person.firstName = this.person1.firstName;
      person.lastName = this.person1.lastName;
      person.email = this.person1.email;
      let user:any = await this.http.put("/user/"+ this.person1.idUser, person).toPromise();

      //update in family
      person = new Object();
      person.relationship = this.person1.relationship;
      person.private = this.person1.private;
      person.receiveEmail = this.person1.receiveEmail;
      person.phoneNumber = this.person1.phoneNumber;
      person.address = this.person1.address;
      await this.http.put("/family/"+ this.person1.id, person).toPromise();

    }else if(num == 2){

      //update on user
      person.firstName = this.person2.firstName;
      person.lastName = this.person2.lastName;
      person.email = this.person2.email;
      await this.http.put("/user/"+ this.person2.idUser, person).toPromise();

      //update in family
      person = new Object();
      person.relationship = this.person2.relationship;
      person.private = this.person2.private;
      person.receiveEmail = this.person2.receiveEmail;
      person.phoneNumber = this.person2.phoneNumber;
      person.address = this.person2.address;
      await this.http.put("/family/"+ this.person2.id, person).toPromise();

    }

  }

}
