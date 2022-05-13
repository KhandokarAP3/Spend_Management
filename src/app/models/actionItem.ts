
export class ActionItem {
  public ID: number;
  public Title: string;
  public Priority: string;
  public AssignedTo: string;
  public Status: string;
  public TrackingItems: string;
  public Description: string;
  public ParentId: string;

  constructor(jsonObj?: any) {
    if (jsonObj) {
      this.ID = jsonObj.ID || -1,
      this.Title = jsonObj.Title || '';
      this.Priority = jsonObj.Priority || '';
      this.AssignedTo = jsonObj.AssignedTo || '';
      this.Status = jsonObj.Status || '';
      this.TrackingItems = jsonObj.TrackingItems || '';
      this.Description = jsonObj.Description || '';
      this.ParentId = jsonObj.ParentId || '';
    }
  }
}