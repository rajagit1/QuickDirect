import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController, NavParams, IonReorderGroup, ToastController, LoadingController } from '@ionic/angular';
import { DragulaService } from 'ng2-dragula';
import { FireBaseService } from '../../services/firebase.service';
import * as _ from "lodash";
import { UserData } from '../../providers/user-data';
@Component({
  selector: 'app-actor-add',
  templateUrl: './actor-add.page.html',
  styleUrls: ['./actor-add.page.scss'],
})
export class ActorAddPage implements OnInit {

  q1 = [

  ];
  q2 = [


  ];

  q3 = [


  ];
  q4 = [


  ];




  todo = { value: '', color: '' };
  selectedQuadrant = 'q1';
  showActress: boolean = true;
  slideOpts: { slidesPerView: number; coverflowEffect: { rotate: number; stretch: number; depth: number; modifier: number; slideShadows: boolean; }; };
  users: any = [];
  actors: any;
  actress: any;
  postData: any;
  username: string;

  constructor(private dragulaService: DragulaService,
    private toastController: ToastController,
    private modalController: ModalController,
    private fireBaseService: FireBaseService,
    private navParams: NavParams,
    public userData: UserData,
    private loadingCtrl: LoadingController) {
    this.dragulaService.drag('bag')
      .subscribe(({ name, el, source }) => {
        el.setAttribute('color', 'danger');
      });

    this.dragulaService.removeModel('bag')
      .subscribe(({ item }) => {
        this.toastController.create({
          message: 'Removed: ' + item.value,
          duration: 2000
        }).then(toast => toast.present());
      });

    this.dragulaService.dropModel('bag')
      .subscribe(({ item }) => {
        item['color'] = 'success';
      });


  }
  getUserName() {
    this.userData.getUsername().then((username) => {
      this.username = username;
    });
  }
  async ionViewDidEnter() {
    this.getUserName();
    const loading = await this.loadingCtrl.create({
      message: 'Loading Stories...',
      duration: 2000
    });

    await loading.present();
    this.fireBaseService.readActors().subscribe(data => {
      data.map(e => {
        let docData = e.payload.doc.data();
        docData['id'] = e.payload.doc.id;
        this.users.push(docData);
      });

      this.q3 = _.filter(this.users, { 'gender': 'M' });
      this.q1 = _.filter(this.users, { 'gender': 'F' });
      loading.onWillDismiss();
    });
  }
  ngOnInit(): void {

    console.table(this.navParams);
    this.postData = this.navParams.data.paramID;
    const slideOpts = {
      slidesPerView: 4,
      coverflowEffect: {
        rotate: 60,
        stretch: 200,
        depth: 20,
        modifier: 1,
        slideShadows: true,
      },

    }
    this.slideOpts = slideOpts;
  }
  async presentToast(msg, type) {
    const toast = await this.toastController.create({
      message: msg,
      animated: true,
      cssClass: type,
      position: 'top',
      duration: 2000
    });
    toast.present();
  }
  mapActors() {
    if (this.q2 && this.q2.length > 2) {
      this.presentToast('Please select 1 Actor & Actress...', 'toast-danger');
      return true;
    }
    if (this.q2 && this.q2.length < 2) {
      this.presentToast('Please select Atleast 1 Actor & Actress...', 'toast-danger');
      return true;
    }
    if (this.q2 && this.q2.length === 2) {
      this.q2.forEach(e => {
        e['associatedStories'].push(this.postData['id']);
        this.fireBaseService.updateActros(e['id'], e);
        if (e['gender'] === 'M') {
          this.postData['actors'].push(e['id'] + '_' + this.username);
        } else if(e['gender'] === 'F') {
          this.postData['actress'].push(e['id'] + '_' + this.username);
        }
      });
      setTimeout(() => {
        this.fireBaseService.updatePost(this.postData['id'], this.postData);
        this.closeModal();
      }, 200);
      
     
    }
  }
  addTodo() {
    switch (this.selectedQuadrant) {
      case 'q1':
        this.todo.color = 'primary';
        break;
      case 'q2':
        this.todo.color = 'secondary';
        break;
      case 'q3':
        this.todo.color = 'tertiary';
        break;
      case 'q4':
        this.todo.color = 'warning';
        break;
    }
    this[this.selectedQuadrant].push(this.todo);
    this.todo = { value: '', color: '' };
  }

  async closeModal() {
    const onClosedData: string = "Wrapped Up!";
    await this.modalController.dismiss(this.postData);
  }

}
