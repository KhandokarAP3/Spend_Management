import { RESTAPIService } from './REST-API.service';
import { IGeneric } from '../services/IGeneric';

export class AutoGeneratedEmailService implements IGeneric {

    constructor(private restAPIService: RESTAPIService) { }

    //Core AutoGeneratedEmailOnDemand SP list CRUD methods
    findOne(id: any): any {

    }

    findAll(): any { }

    persist(object: any): any {
        this.restAPIService.saveAutoGeneratedEmailsOnDemand(object).subscribe(response => {
            if (this.restAPIService.isSuccessResponse(response)) {
                console.log('The following AutoGeneratedEmailOnDemand item was successfully saved the system:', response);
            } else {
                console.log('Persist AutoGeneratedEmailOnDemand API request was not successful.');
            }
        });
    }

    update(Object: any): any { }
    delete(Object: any): void { }
    deleteById(id: any): void { }
}