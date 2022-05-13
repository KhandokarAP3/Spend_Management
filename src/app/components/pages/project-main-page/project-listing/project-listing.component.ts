import { AfterViewInit, Component, HostBinding} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { PageComponentParentComponent } from '../../../../page-component-parent.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RESTAPIService } from '../../../../services/REST-API.service';
import { ToastrService } from 'ngx-toastr';
import { ExportToCsv } from 'export-to-csv';
import { CurrencyPipe } from '@angular/common';
import {CommonService} from '../../../../services/common.service';
import {
  Pagination,
  SortAndFilterTopLevelObjects
} from '../../../../pipes/pipes';
import {ObjectOperationsService} from "../../../../services/object-operations.service";
import {AppConstants} from "../../../../AppConstants";
import {forkJoin} from "rxjs";
declare const _spPageContextInfo: any;

@Component({
  selector: 'app-projects',
  templateUrl: './project-listing.component.html'
})
export class ProjectListingComponent extends PageComponentParentComponent implements AfterViewInit {
  active = 1;
  @HostBinding('style.minHeight') height = `auto`;
  readonly csvOptions = {
    filename: 'projects',
    showLabels: true,
    headers: []
  };
  public selectedValue = 'MyProjects';
  showSpinner = false;
  projects: any[] = [];
  projectData: any;
  sortBy = 'Title';
  reverse = true;
  filterValue = '';
  columnNames = [
    { av: 'ProjectIdentifier', dv: 'Project Identifier' },
    { av: 'Title', dv: 'Title' },
    { av: 'POC', dv: 'POC' },
    { av: 'EstimatedValue', dv: 'Estimated Value' },
    { av: 'CreationDate', dv: 'Creation Date' },
    { av: 'RequestedAwardDate', dv: 'Requested Award Date' },
    { av: 'Status', dv: 'Status' }
  ];
  paginationParams = {
    itemsPerPage: 10,
    currentPage: 1,
    itemCount: 0,
  };
  filterByFields = ['Identifier', 'Title', 'CreationDate', 'Requested_Award_Date', 'POC', 'EstimatedValue', 'Status'];
  page = 1;
  previosPage: any;
  nextPage: any;
  projectsData: any[] = [];
  showAllProjects = false;
  showTeamProjects = false;
  showMyProjects = false;
  userInfo: any;
  myProjectsArr: any[] = [];
  teamMateProjectsArr: any[] = [];
  allProjectsArr: any[] = [];
  userRolesDetail: any;
  noProjectAssigned = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal,
    private restAPIService: RESTAPIService,
    private currencyPipe: CurrencyPipe,
    private toaster: ToastrService,
    public commonService: CommonService,
    private sortAndFilterTopLevelObjects: SortAndFilterTopLevelObjects,
    private pagination: Pagination
  ) {
    super();
    for (const column of this.columnNames) {
      this.csvOptions.headers.push(column.dv);
    }
  }

  updateCurrentPageIndex(currentPage) {
    setTimeout(() => {
      this.paginationParams = {...this.paginationParams, currentPage};
    });
  }

  updateItemsPerPage(itemsPerPage) {
    setTimeout(() => {
      this.paginationParams = {...this.paginationParams, itemsPerPage};
    });
  }

  clearSearch(){
    this.filterValue = '';
  }

  // 'Requirements Development', 'Market Research', 'Develop Acquisition Plan', 'Procurement Request Package', 'Completed'
  filterFn(items: any[], filterValue: string, usePagination: boolean = true) {
    let tempResult = this.sortAndFilterTopLevelObjects.transform(items, this.filterByFields, filterValue, this.sortBy, this.reverse, true);
    if (usePagination) {
      tempResult = this.pagination.transform(tempResult, this.paginationParams);
    }
    if (this.active !== 3) {
      const result = [];
      // for (const project of tempResult) {
      //   if (project.Status === 'Completed' && this.active === 2) {
      //       result.push(project);
      //   }
      //   else if (this.active === 1 && project.Status === 'Active') {
      //       result.push(project);
      //   }
      // }
      // return result;
      for (const project of tempResult) {
        if (this.active === 1) {
          if (project.Status !== AppConstants.AWARDED &&
              project.Status !== AppConstants.INACTIVE &&
              project.Status !== AppConstants.SUBMITTED
            ) {
            result.push(project);
          }
        }
        else if (this.active === 2) {
          if (project.Status === AppConstants.AWARDED ||
            project.Status === AppConstants.INACTIVE ||
            project.Status === AppConstants.SUBMITTED
            ) {
            result.push(project);
          }
        }
      }
      return result;
    }
    return tempResult;
  }

  // exportToCSV() {
  //   const csvExporter = new ExportToCsv(this.csvOptions);
  //   const filteredList = this.filterFn(this.projects, this.filterValue, false);
  //   const data = filteredList.map((project) => {
  //     return {
  //       'Project Identifier': project.Identifier,
  //       Title: project.Title || '',
  //        POC: project.POC,
  //       'Estimated Value': project.EstimatedValue ? '' : this.currencyPipe.transform(project.EstimatedValue, 'USD', true),
  //       'Creation Date': project.CreationDate || '',
  //       'Requested Award Date': project.Requested_Award_Date || '',
  //       Status: project.Status || ''
  //     };
  //   });
  //   csvExporter.generateCsv(data);
  // }

  exportToCSV() {
    const csvExporter = new ExportToCsv(this.csvOptions);
    const filteredList = this.filterFn(this.projects, this.filterValue, false);
    const data = filteredList.map((project) => {
      return {
        'Project Identifier': project.Identifier,
        Title: project.Title || '',
         POC: project.POC,
        'Estimated Value': project.EstimatedValue,
        'Creation Date': project.CreationDate || '',
        'Requested Award Date': project.Requested_Award_Date || '',
        Status: project.Status || ''
      };
    });
    csvExporter.generateCsv(data);
  }

  deleteProject(project) {
    if (!this.commonService.canDeleteProjects(project)) {
      return;
    }
    if (confirm('Are you sure you want to delete this project?')) {
      this.showSpinner = true;
      this.restAPIService.deleteProject(project.ID).subscribe((response: any) => {
        this.showSpinner = false;
        this.projects = this.projects.filter((obj) => {
          return obj.ID !== project.ID;
        });
        this.toaster.success('Project deleted successfully', '', {timeOut: 5000});
      });
    }
  }

  selectCategoryFN() {
    if (!this.noProjectAssigned) {
      if (this.selectedValue === 'MyProjects') {
        this.projects = this.myProjectsArr;
      }else if (this.selectedValue === 'TeamProjects') {
        this.projects = this.teamMateProjectsArr;
      }else if (this.selectedValue === 'AllProjects') {
        this.projects = this.allProjectsArr;
      }
    }
  }

  createNewProject() {
    this.router.navigate(['projects', 'newcontract'], { queryParams: { mode: 'create' }, state: { project: {}}});
  }

  goToProject(project, isEdit?) {
    isEdit = isEdit === true;
    if (isEdit && !this.commonService.canEditProjects(project)) {
      return;
    }
    this.router.navigate(['projects', project.ID], { queryParams: { mode: isEdit ? 'edit' : 'view' } });
  }

  sortTableBy(key) {
    if (this.sortBy === key) {
      this.reverse = !this.reverse;
    }
    this.sortBy = key;
  }

  ngAfterViewInit() {
    this.route.queryParams.subscribe((params) => {
      let columnFilterString;
      if (params.filterBy && params.filterValue) {
        columnFilterString = `${params.filterBy} eq '${params.filterValue}'`;
      } else if (params.filter) {
        columnFilterString = params.filter;
      }
      this.userInfo = {
        name: _spPageContextInfo.userDisplayName,
        email: _spPageContextInfo.userEmail
      };

      forkJoin([this.restAPIService.getDataFromProjectGeneral(columnFilterString, AppConstants.SELECTED_FIELD_PROJECT), this.restAPIService.getUserRoles()]).subscribe((responses: any[]) => {
        const projectsMap: any = {};
        this.projects = [];
        this.projectsData = [];
        this.myProjectsArr = [];
        this.teamMateProjectsArr = [];
        for (const project of responses[0].data) {
          this.projects = responses[0].data;
        }
        if (this.projects.length) {
          this.projectsData = this.projects;

          for (const project of this.projects) {
            if (project.Team && Object.entries(project.Team).length) {
              if (ObjectOperationsService.isMyProject(this.userInfo.name, project.Team)) {
                this.showMyProjects = true;
                this.myProjectsArr.push(project);
              }

              if (ObjectOperationsService.isTeamMate(this.userInfo.name, project.Team)) {
                this.showTeamProjects = true;
                this.teamMateProjectsArr.push(project);
              }

              if (project.Team.teamMates && project.Team.teamMates.length) {
                const data = project.Team.teamMates.filter(b => b.name === this.userInfo.name);
                if (data && data.length){
                  if (this.teamMateProjectsArr.length > 0) {
                    const dataFound = this.teamMateProjectsArr.find(x => x.ID === project.ID);
                    if (!dataFound){
                      this.teamMateProjectsArr.push(project);
                    }
                  }else {
                    this.teamMateProjectsArr.push(project);
                  }
                  this.showTeamProjects = true;
                }
              }
            }
          }
        }

        if (responses[1].data && responses[1].data.length){
          this.userRolesDetail = responses[1].data;
        }

        if (this.userRolesDetail && this.userRolesDetail.length) {
          const results = this.userRolesDetail.filter(x => x.Title.includes('SSC Administrator') || x.Title.includes('Head of Contracting Activity') || x.Title.includes('Senior Procurement Executive') || x.Title.includes('Program Director') || x.Title.includes('CPI Administrator') || x.Title.includes('Quality Assurance Compliance'));
          if (results && results.length > 0){
            this.showAllProjects = true;
            this.allProjectsArr = this.projectsData;
          }
        }
        if (this.myProjectsArr && this.myProjectsArr.length){
          this.projects = this.myProjectsArr;
        }else if (this.teamMateProjectsArr && this.teamMateProjectsArr.length){
          this.projects = this.teamMateProjectsArr;
          this.selectedValue = 'TeamProjects';
        }else if (this.allProjectsArr && this.allProjectsArr.length){
          this.projects = this.allProjectsArr;
          this.selectedValue = 'AllProjects';
        }else{
          this.showAllProjects = true;
          this.showTeamProjects = true;
          this.showMyProjects = true;
          this.noProjectAssigned = true;
          this.projects = [];
          this.toaster.warning('You have no projects to view.');
        }
        this.paginationParams.itemCount = this.projects.length;
      });
    });
    setTimeout(() => {
      this.height = `${window.innerHeight - 110}px`;
    });
  }
}
