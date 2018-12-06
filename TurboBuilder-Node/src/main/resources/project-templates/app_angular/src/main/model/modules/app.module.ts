import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { DialogService } from 'turbogui-angular';
import { AppComponent } from '../../view/components/app/app.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentsModule } from 'src/main/model/modules/components.module';


/**
 * This file contains the root application module that is launched at application startup
 * and constructs the application
 */
@NgModule({

  declarations: [
    AppComponent
  ],

  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatSnackBarModule,
    MatDialogModule,
    ComponentsModule
  ],

  providers: [
      DialogService
  ],

  bootstrap: [AppComponent]
})

export class AppModule { }
