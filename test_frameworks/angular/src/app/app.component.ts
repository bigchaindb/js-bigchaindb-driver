import { Component } from '@angular/core';
import { BdbService } from './bdb.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  public returnedHtml = ''

  constructor(private bdb: BdbService){

  }

  create() {
    this.bdb.create().then((tx: any) => {
      this.returnedHtml = 'Transaction: '+tx.id
    })
  }

}
