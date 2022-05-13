declare const _spPageContextInfo: any;
export class AppConstants {
  public static readonly licenseURL = 'https://seventhsensefpdsapi.herokuapp.com/getLicense';

  // public static readonly getCall = 'https://prod-26.usgovtexas.logic.azure.us/workflows/077b21555b534472acc8b489f1873344/trigge[%E2%80%A6].0&sig=cTwgm_CqMIvHT5bANqFprxcNJEGV0LBq3a-KVlXZp4I';

  public static readonly AP3DateRegex = /(0[1-9]|1[012])[-](0[1-9]|[12][0-9]|3[01])[-](19|20)[0-9][0-9]/;

  public static readonly spPageContextInfo = _spPageContextInfo;

  public static readonly AP3DateFormat = 'MM-DD-YYYY';

  public static readonly RolesList = ['Head of Contracting Activity', 'Senior Procurement Executive', 'Program Director/Program Executive Officer', 'First Line Manager(s)', 'Requirements Owner', 'Contract Officer', 'Contract Officer Representative', 'Contract Specialist', 'Program Manager', 'Program Analyst (similar to BA)', 'Financial Management (Budget Execution)', 'Support Contractor', 'CPI Administrator', 'SSC Administrator', 'Quality Assurance/Compliance'];

  /***** HTTP DEV URL's */
  public static readonly DEV_DOC_WKFL_UPDATE_URL = 'https://prod-04.usgovtexas.logic.azure.us/workflows/52be6dd951a74cca8d6783e5967d87e1/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=MZkBy-RD5qkspR2n1DJyewGPezIg7ooAlRvXnkiuGZ8';

  public static readonly DEV_DOC_WKFL_CREATE_APPROVERS_URL = 'https://prod-22.usgovtexas.logic.azure.us:443/workflows/61047a0ec6cb4799b3b477b4da0dbebc/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Q9yL04etAH-5jrq-J-pFbvnpfv1bSITZLlxWPSmPQOY';

  public static readonly DEV_EDIT_DOCUMENT_URL = 'https://prod-03.usgovtexas.logic.azure.us/workflows/3855a38ef88e4d4db688b784c3f78a7d/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=m4yUlTJjbupvxKxTRZ4LdsBirBUnl_VZwz8NqdYfzbQ';

  public static readonly DEV_VIEW_DOCUMENT_URL = 'https://prod-02.usgovtexas.logic.azure.us/workflows/b699cc073db84062a0c56d0c29ecb761/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Ibs7t_A16kIdg2yr2BZXZCtSETpJ_kvfKsg7IVSxPs4';

  public static readonly DEV_CREATE_DOCUMENT_URL = 'https://prod-10.usgovtexas.logic.azure.us:443/workflows/70dacb6ed7df408e8e2f8a23bf71c831/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=ICCoP944qV9s0dMkDFEziPEWLnR9VG7J1M6blbhGWp0';

  public static readonly DEV_SHARE_DOCUMENT_URL = 'https://prod-23.usgovtexas.logic.azure.us/workflows/1a4033b4fbdd4130a5f97afdb3f90001/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=y-Ugoq7lpHu2LBYzHvUMMpN1H5AUVcA6bkzqsettGOI';

  public static readonly DEV_ATTACHDOCUMENTWITHPROJECT_ACTIVITY_URL = 'https://prod-21.usgovtexas.logic.azure.us/workflows/516500e268834d1b87a117508170e435/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=CjBbeyCG-eVmg_uVpekbKPCLX--N-D9zuOpVyBz34gE';

  /***** HTTP PROD URL's */
  public static readonly PROD_DOC_WKFL_UPDATE_URL = 'https://prod-16.usgovtexas.logic.azure.us/workflows/606f6fa798ad492387ce620d174d32d5/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=YaT4cXWSoZz2nKJbcyqKGyKbRatfSaxJNR5inzc6RsM';

  public static readonly PROD_DOC_WKFL_CREATE_APPROVERS_URL = 'https://prod-15.usgovtexas.logic.azure.us/workflows/08779ef1d6df44f6853a1b2535a4a1ac/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=vVeOCXZ-i7SBwvpk3JV42MbRy2m2SgBgMPuC5R3kUfk';

  public static readonly PROD_EDIT_DOCUMENT_URL = 'https://prod-12.usgovtexas.logic.azure.us/workflows/7b85acacd5f34697a94c4d1f3d12ab11/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=DcI7ncP5yudS8RQz5rigTa6xTWnpMeZs_89KEJGAoI0';

  public static readonly PROD_VIEW_DOCUMENT_URL = 'https://prod-06.usgovtexas.logic.azure.us/workflows/c1f997a23c864b50af6194971896cf9b/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Dnhn7J_-LDzOZcvth3JOHoH4pxc-KlYYjn3EbmPSoM8';

  public static readonly PROD_CREATE_DOCUMENT_URL = 'https://prod-05.usgovtexas.logic.azure.us/workflows/45dd2b6ef3094657bd192d2b24770ef6/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=iPClzWOMKlkQ-6iQ_axjRlIPLb7XrInD12aTWikRBp0';

  public static readonly PROD_SHARE_DOCUMENT_URL = 'https://prod-25.usgovtexas.logic.azure.us/workflows/b24c7918a26546f2ab01445aa484d2ae/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=VqEOL7Ir6R53bQYCoLctWbeIeasYBcWrGOau_9sRSGI';

  public static readonly PROD_ATTACHDOCUMENTWITHPROJECT_ACTIVITY_URL = 'https://prod-25.usgovtexas.logic.azure.us/workflows/366b0509b4fd43438ec983f6123db50f/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=-Njgop9FXDnTxvP1Ll_L0Rcxf2tAkXdS4T9xnaxunuI';

  /***** System URL generation */
  // public static readonly ACTIVITY_URL =  _spPageContextInfo.webAbsoluteUrl + '/SitePages/Home.aspx/activities/';

  public static readonly ACTIVITY_URL =  _spPageContextInfo.webAbsoluteUrl + '/SitePages/KitoInstance.aspx/activities/';

  public static readonly ACTION_ITEM_URL = _spPageContextInfo.webAbsoluteUrl + '/SitePages/Home.aspx/action-item?actionItemId=';
  /************************** */

  public static readonly WORKFLOW_URLS = class {
    public static readonly DOC_WKFL_UPDATE_URL = AppConstants.isProdEnv() ? AppConstants.PROD_DOC_WKFL_UPDATE_URL : AppConstants.DEV_DOC_WKFL_UPDATE_URL;
    public static readonly DOC_WKFL_CREATE_APPROVERS_URL = AppConstants.isProdEnv() ? AppConstants.PROD_DOC_WKFL_CREATE_APPROVERS_URL : AppConstants.DEV_DOC_WKFL_CREATE_APPROVERS_URL;
    public static readonly EDIT_DOCUMENT_URL = AppConstants.isProdEnv() ? AppConstants.PROD_EDIT_DOCUMENT_URL : AppConstants.DEV_EDIT_DOCUMENT_URL;
    public static readonly VIEW_DOCUMENT_URL = AppConstants.isProdEnv() ? AppConstants.PROD_VIEW_DOCUMENT_URL : AppConstants.DEV_VIEW_DOCUMENT_URL;
    public static readonly CREATE_DOCUMENT_URL = AppConstants.isProdEnv() ? AppConstants.PROD_CREATE_DOCUMENT_URL : AppConstants.DEV_CREATE_DOCUMENT_URL;
    public static readonly SHARE_DOCUMENT_URL = AppConstants.isProdEnv() ? AppConstants.PROD_SHARE_DOCUMENT_URL : AppConstants.DEV_SHARE_DOCUMENT_URL;
    public static readonly ATTACHDOCUMENTWITHPROJECT_ACTIVITY_URL = AppConstants.isProdEnv() ? AppConstants.PROD_ATTACHDOCUMENTWITHPROJECT_ACTIVITY_URL : AppConstants.DEV_ATTACHDOCUMENTWITHPROJECT_ACTIVITY_URL;
  };

  public static readonly PROCESS_PR_TO_CONTRACTS = "Process PR to Contracts";

  public static readonly BURN_RATE = 'BURN_RATE';

  public static readonly DEPARTMENT_CONTRACTS = 'DEPARTMENT_CONTRACTS';

  public static readonly HIGH_PRIORITY_ACTION_ITEMS = 'HIGH_PRIORITY_ACTION_ITEMS';

  public static readonly OMB_CATEGORY_MANAGEMENT = 'OMB_CATEGORY_MANAGEMENT';

  public static readonly PROJECTS = 'PROJECTS';

  public static readonly PROJECT_TITLE = 'ProjectTitle';

  public static readonly CREATE_MODE = 'create';

  public static readonly EDIT_MODE = 'edit';

  public static readonly DELETE = 'delete';

  public static readonly REQ_PR_PACKAGE_DOC_CATEGORIES:string[] = [
    'Requirements Definition Document/Needs Statement',
    'Independent Government Cost Estimate (IGCE)',
    'Market Research Report',
    'Acquisition Plan',
    'COR Nomination'];

  public static readonly DOC_CAT_ARR: any[] = [
    'Market Research Report', 'Acquisition Plan', 'Justifications to Limit Competition (JOFOC/LSJ)', 'Requirements Definition Document/Needs Statement', 'Market Research Plan',
    'Sources Sought', 'Request For Information (RFI)', 'Statement of Work (SOW)', 'Statement of Objective (SOO)', 'Performance Work Statement (PWS)', 'Work Break Down Structure (WBS)',
    'Independent Government Cost Estimate (IGCE)', 'COR Nomination', 'SB Coordination Report', 'SBA 8(a) Acceptance', 'Small Business Review', 'Other'];

  public static readonly SOFTWARE_LICENSE_INVENTORY_CONTRACTS = 'SOFTWARE_LICENSE_INVENTORY_CONTRACTS';

  public static readonly TOP_CATEGORIES_OF_SPEND = 'TOP_CATEGORIES_OF_SPEND';

  public static readonly WORKLOAD_TRACKING = 'WORKLOAD_TRACKING';

  public static readonly TOP_CONTRACTORS = 'TOP_CONTRACTORS';

  public static readonly TOTAL_FUNDING = 'TOTAL_FUNDING';

  public static readonly TOTAL_FUNDING_DOLLARS = 'TOTAL_FUNDING_DOLLARS';

  public static readonly TOTAL_INVOICES = 'TOTAL_INVOICES';

  public static readonly UPCOMING_ACTIVITIES = 'UPCOMING_ACTIVITIES';

  public static readonly CONTRACT_CLOSEOUTS = 'Contract Closeouts';

  public static readonly CONTRACT_MODIFICATION = 'Contract Modification';

  public static readonly CPARS = 'Support for Contractor Performance Assessment Rating System (CPARS)';

  public static readonly EMAIL_SENT = 'Request received. Someone from our team will reach out shortly to assist you.';

  public static readonly EMAIL_NOT_SENT = 'Your message was not sent.';

  public static readonly SELECTED_FIELD_PROJECT = 'Identifier, Title, Description, ContractType, Sponsor, ProgramOffice, POC, EstimatedValue, CreationDate, Requested_Award_Date, Status, NAICS_Code, NAICS_Description, ContractVehicle, PSC, PR_to_Contracts_Date, Funding_Status, AreFundsExpiring, ContractVehicleTierRating, Team, ProjectFilenames, ID, AuthorId';

  public static readonly SELECTED_FIELD_ACTIVITY_LIST = 'ID, Identifier, Title, ActivityType, ActivityFileNames, AssignedTo, Status, ScheduledDate, AuthorId, TrackingItems';

  public static readonly ACTIVITY_TYPES = 'Title, WorkCategory';

  public static readonly ACTIVITY_HELPFUL_LINKS = 'Title, Category, Link, Description, ActivityType';

  public static readonly ACTIVITY_VIDEO_TUTORIALS = 'Title, Category, Link, Description, ActivityType';

  public static readonly ACTIVITY_DOCUMENT_TEMPLATES = 'Title, Category, Link, Description, ActivityType';

  public static readonly ACTIVITY_WORKFLOWS = 'ID, ActivityTitle, workflowObj';

  public static readonly REQ_DEV = 'Requirements Development';

  public static readonly MARKET_RESEARCH = 'Market Research';

  public static readonly ACQ_PLAN = 'Develop Acquisition Plan';

  public static readonly PROC_PCKG = 'Procurement Request Package';

  public static readonly OVERVIEW = 'Acquisitions Overview';

  public static readonly ALL = 'All';

  public static readonly TODO = 'To-do';

  public static readonly IN_PROG = 'In-progress';

  public static readonly MGR_REVIEW = 'Manager Review';

  public static readonly COMPLETED = 'Completed';

  public static notificationList: any[] = [];

  public static readonly PROJECT_LEVEL = "Project";

  public static readonly ACTIVITY_TYPE = 'Activity';

  public static readonly ACTION_ITEM_TYPE = 'Action Item';

  public static readonly ASSIGN_TO_ACTION_ITEM = 'Assign To - Action Item';

  public static readonly ASSIGN_TO = 'Assign To';

  public static readonly ASSIGN_TO_TEXT = 'You have been assigned a task';

  public static readonly PR_PCKG_APPROVAL = "A PR package has been submitted for your approval.";

  public static readonly ACTION_REQUIRED = 'Action Required';

  public static readonly UNASSIGN_TO = 'Unassign_Activity';

  public static readonly UNASSIGN_TO_ACTION_ITEM = "Unassign_Action_Item";

  public static logoutPath = '/_layouts/signout.aspx';

  public static readonly APPROVED = 'Approved';

  public static readonly CANCEL = 'Cancel';

  public static readonly CANCELLED = 'Cancelled';

  public static readonly REJECT = 'Reject';

  public static readonly REJECTED = 'Rejected';

  public static readonly YES = 'Yes';

  public static readonly NO = 'No';

  public static readonly PENDING = 'Pending';

  public static readonly SUBMITTED = 'Submitted';

  public static readonly AWARDED = 'Awarded';

  public static readonly INACTIVE = 'Inactive'

  public static readonly RECEIVED = 'Received';

  public static readonly SENT = 'Sent';

  public static actionItemNotificationsToBeDeleted = [];

  public static actionItemNotificationsToBeAdded = [];

  public static actionItemNotificationsToBeEdited = [];

  public static originalActionItemList = [];

  public static readonly TrackingItemCategoryOptions = class {
    public static readonly BEFORE_SCHEDULED_DATE = 'Before Scheduled Date';
    public static readonly AFTER_RECEIPT_DATE = 'After Receipt Date';
  };

  public static AttachedFilenames: string[] = [];

  public static toBeModifiedActivityIdList: string[] = [];

  public static fileMap = new Map();

  public static activityAttachmentFileMap = new Map();

  public static isAlreadyLoaded = false;

  public static ActionItemConfirmationMessage = 'Are you sure you wish to exit this page? Any unsaved action-item data will be lost. Click the UPDATE or ATTACH TO ACTIVITY button below in order to append your changes to the parent activity.';
  public static RouteDeactivateConfirmationMessage = 'Are you sure you wish to exit this page without saving your data? All data will be lost.';

  public static readonly WidgetNames = class {
    public static readonly AVERAGE_TIME_TO_COMPLETION = 'AVERAGE_TIME_TO_COMPLETION';
    public static readonly NUMBER_OF_ACTIVE_PROJECTS = 'NUMBER_OF_ACTIVE_PROJECTS';
    public static readonly TOTAL_DOLLAR_AMOUNT_OF_ACTIVE_PROJECTS = 'TOTAL_DOLLAR_AMOUNT_OF_ACTIVE_PROJECTS';
    public static readonly NUMBER_OF_PROJECTS_WITH_EXPIRING_FUNDS = 'NUMBER_OF_PROJECTS_WITH_EXPIRING_FUNDS';
    public static readonly BUDGET_PROGRESS = 'BUDGET_PROGRESS';
    public static readonly ACTIVITY_STATUS_DASHBOARD_METRIC = 'ACTIVITY_STATUS_DASHBOARD_METRIC';
    public static readonly PROJECTS_BY_WORK_CATEGORY_METRIC = 'PROJECTS_BY_WORK_CATEGORY_METRIC';
    public static readonly AVERAGE_TIME_TO_COMPLETE_DASHBOARD = 'AVERAGE_TIME_TO_COMPLETE_DASHBOARD';
    public static readonly PROJECTS_METRIC = 'PROJECTS_METRIC';
    public static readonly WORKLOAD_TRACKING_DASHBOARD_METRIC = 'WORKLOAD_TRACKING_DASHBOARD_METRIC';
  };

  public static isProdEnv() {
    return _spPageContextInfo.siteServerRelativeUrl === '/sites/EnlightenedSolutionsProd';
  }
}
