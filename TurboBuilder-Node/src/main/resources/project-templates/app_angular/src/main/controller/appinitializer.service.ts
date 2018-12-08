import { Injectable } from '@angular/core';


/**
 * Service that is execute before the application starts.
 * It is used to load setups, locales, and any other resources that must be avilable
 * at the very first begining of the application
 */
@Injectable()
export class AppInitializerService {


    /**
     * This method is executed at application startup and before any other thing.
     * Angular will wait till this promise finishes before continuing with the application
     * initialization
     */
    load(): () => Promise<any> {

        return (): Promise<any> => {

            return new Promise((resolve) => {

                // Perform all the application initializations
                // TODO

                // Call the reslove method once all the initializations have finished
                resolve();
            });
        };
    }

}
