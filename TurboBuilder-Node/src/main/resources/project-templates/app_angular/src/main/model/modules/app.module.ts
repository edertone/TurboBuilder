import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler, APP_INITIALIZER } from '@angular/core';
import { TurboGuiAngularModule, GlobalErrorService } from 'turbogui-angular';
import { AppComponent } from '../../view/components/app/app.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentsModule } from 'src/main/model/modules/components.module';
import { AppInitializerService } from '../../controller/appinitializer.service';


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
        TurboGuiAngularModule,
        ComponentsModule
    ],

    providers: [
        {
            provide: APP_INITIALIZER,
            useFactory: (appInitializerService: AppInitializerService) => appInitializerService.load(),
            deps: [AppInitializerService],
            multi: true
        },
        AppInitializerService,
        {
            provide: ErrorHandler,
            useClass: GlobalErrorService
        },
        GlobalErrorService
    ],

    bootstrap: [AppComponent]
})

export class AppModule { }
