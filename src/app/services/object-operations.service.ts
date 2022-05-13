import { Injectable } from '@angular/core';
import * as moment from 'moment';
import {AppConstants} from '../AppConstants';

@Injectable()
export class ObjectOperationsService {
  constructor() {

  }
  private static addNumberField(obj, key, value) {
    obj[key] = value || 0;
  }
  private static addTextField(obj, key, value) {
    obj[key] = value || '';
  }

  public static getProjectForSave(projectObj) {
    delete projectObj.isTeamProject;
    const obj: any = {
      __metadata: { type: 'SP.Data.ProjectGeneralListItem' }
    };
    for (const property in projectObj) {
      if (projectObj.hasOwnProperty(property)) {
        if (property === 'ProjectFilenames') {
          obj.ProjectFilenames = JSON.stringify(projectObj.ProjectFilenames);
        } else if (property === 'Team') {
          obj.Team = JSON.stringify(projectObj.Team);
        } else if (property === 'EstimatedValue') {
          obj.EstimatedValue = JSON.stringify(projectObj.EstimatedValue);
        } else if (property === 'Requested_Award_Date') {
          if (projectObj.Requested_Award_Date === null) {
            obj.Requested_Award_Date = '';
          }
          else {
            obj.Requested_Award_Date = projectObj.Requested_Award_Date;
          }
        } else if (property === 'PR_to_Contracts_Date') {
          if (projectObj.PR_to_Contracts_Date === null) {
            obj.PR_to_Contracts_Date = '';
          }
          else {
            obj.PR_to_Contracts_Date = projectObj.PR_to_Contracts_Date;
          }
        } else if (property === 'AreFundsExpiring') {
          obj.AreFundsExpiring = projectObj.AreFundsExpiring;
        } else if (property === 'Requested_Award_DateERROR') {
          delete projectObj[property];
        } else if (property === 'PR_to_Contracts_DateERROR') {
          delete projectObj[property];
        }else {
          obj[property] = projectObj[property] || '';
        }
      }
    }
    delete obj.ID;
    return obj;
  }

  public static getNewTeamObject() {
    return {
      requirementsowner: '',
      contractingOfficer: '',
      contractSpecialist: '',
      contractingOfficerRepresentative: '',
      assignedSupportContractor: '',
      projectManager: '',
      other: '',
      teamMates: []
    };
  }

  public static getNewTeamMatesObject() {
    return {
      title: '',
      name: '',
      email: '',
      label: ''
    };
  }

  public static isMyProject(userName, team: any) {
    if (team) {
      return userName === team.requirementsowner || userName === team.contractingOfficer || userName === team.contractingOfficerRepresentative;
    }
    return false;
  }

  public static isTeamProject(userName, team: any) {
    if (userName === team.assignedSupportContractor || userName === team.projectManager || userName === team.contractSpecialist) {
      return true;
    }
    for (const teamMate of team.teamMates) {
      if (userName === teamMate.name) {
        return true;
      }
    }
    return false;
  }

  public static isTeamMate(userName, team: any) {
    return ObjectOperationsService.isMyProject(userName, team) || ObjectOperationsService.isTeamProject(userName, team);
  }

  public static parseActivityList(inputJSON): any {
    for (const prop in inputJSON) {
      if (inputJSON.hasOwnProperty(prop)) {
        if (prop === 'ActivityFileNames') {
          if (inputJSON.ActivityFileNames) {
            inputJSON.ActivityFileNames = JSON.parse(inputJSON.ActivityFileNames);
          }
        }
        if (prop === 'TrackingItems') {
          inputJSON.TrackingItems = JSON.parse(inputJSON.TrackingItems);
        }
      }
    }
    return inputJSON;
  }

  public static getActivityObjectForSave(activityObj) {
    const obj: any = {
      __metadata: { type: 'SP.Data.ActivityListListItem' }
    };
    for (const property in activityObj) {
      if (activityObj.hasOwnProperty(property)) {
        if (property === 'ActivityFileNames') {
          obj.ActivityFileNames = JSON.stringify(activityObj.ActivityFileNames);
        }
        else if (property === 'WorkflowObj') {
          obj.WorkflowObj = activityObj.WorkflowObj !== null ? JSON.stringify(activityObj.WorkflowObj) : JSON.stringify({});
        }
        else if (property === 'TrackingItems') {
          obj.TrackingItems = JSON.stringify(activityObj.TrackingItems);
        }
        else if (activityObj.Status === 'Completed') {
          const today: any = moment().startOf('day');
          obj.ActivityMarkAsCompletedDate = today.format(AppConstants.AP3DateFormat);
        }
        else {
          obj[property] = activityObj[property] || '';
        }
      }
    }
    delete obj.ID;
    return obj;
  }

}
