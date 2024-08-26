import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { CreateTaskPayload, Task } from './interfaces/application';
import { Router } from '@angular/router';
import { TaskService } from './services/todos.service';
import { SweetalertService } from './services/sweetalerts.service';
import { ToastService } from './services/toast.service';

@Component({
  selector: 'app-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.css']
})
export class ContainerComponent implements OnInit {
     public createRecordForm: FormGroup;
     public editRecordForm: FormGroup;
     formSubmitted =false;


     @ViewChild('createModal') public createModal!: ModalDirective;
     @ViewChild('editModal') public  editModal!: ModalDirective;
     @ViewChild('deleteModal') public deleteModal!: ModalDirective;
      
     records: Task[] =[];
     filteredRecords: Task[] =[];


     previous: string | null;
     editingIndex: number | null = null;

   constructor(
           private formbuilder: FormBuilder, 
           private router: Router,
           private taskService: TaskService,
           public sweetAlertService: SweetalertService,
           public toastService: ToastService,
          ) {

    this.createRecordForm = this.formbuilder.group({
      title: new FormControl('', Validators.compose([Validators.required, Validators.minLength(2)])),
      description: new FormControl('', Validators.compose([Validators.required, Validators.minLength(2)])),
      priority: new FormControl('', Validators.compose([Validators.required, Validators.minLength(2)])),
      dueDate: new FormControl('', Validators.compose([Validators.required, Validators.minLength(2)])),
      status: new FormControl('Pending', Validators.compose([Validators.required, Validators.minLength(2)])),
    
    });

    this.editRecordForm = this.formbuilder.group({
      title: new FormControl('', Validators.compose([Validators.required, Validators.minLength(2)])),
      description: new FormControl('', Validators.compose([Validators.required, Validators.minLength(2)])),
      priority: new FormControl('', Validators.compose([Validators.required, Validators.minLength(2)])),
      dueDate: new FormControl('', Validators.compose([Validators.required, Validators.minLength(2)])),
      status: new FormControl('Pending', Validators.compose([Validators.required, Validators.minLength(2)])),
    });

   


    let current_url = String(window.location.pathname)
    const current = localStorage.getItem('current');
    this.previous = current;
    if (current) {
      localStorage.setItem('previous', current)
      localStorage.setItem('current', current_url)
    } else {
      localStorage.setItem('current', current_url)
    }

   }

  ngOnInit(){
   this.fetchRecord();
  //  this.filteredRecords = this.records;

  }


  back_btn(){
    this.router.navigate([this.previous]);
  }




  fetchRecord(){
    this.taskService.getTasks().subscribe((tasks)=>{
        this.records = tasks;
        this.records.sort((a, b) => {
        const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
      this.filteredRecords = this.records; // Ensure filteredRecords is updated
    })
    
  }

  filterTasks(status: string){
    if (status) {
      this.filteredRecords = this.records.filter(record => record.status === status);
    } else {
      this.filteredRecords = this.records; // Reset to all records
    }
  }


  createRecord(){
    if(this.createRecordForm.invalid){
      this.formSubmitted = true;
      const errorMessages = this.getFormErrors(this.createRecordForm);
      this.toastService.showToastNotification('error', 'Kindly Correct the errors highlighted to proceed: ', errorMessages);
    }else{
      this.sweetAlertService.showConfirmation('Confirmation', 'Do you wish to proceed creating record?').then((res)=>{
        if(res){
          const payload: CreateTaskPayload = {
            title: this.createRecordForm.get('title')!.value,
            description:this.createRecordForm.get('description')!.value,
            priority:this.createRecordForm.get('priority')!.value,
            dueDate:this.createRecordForm.get('dueDate')!.value,
            status: this.createRecordForm.get('status')!.value,
          }
          console.log('Record created', payload)

          this.taskService.createTask(payload as Task).subscribe(() => {
            this.fetchRecord();
            this.createRecordForm.reset();
            this.createModal.hide();
            this.createRecordForm.get('status')!.setValue('Pending');
            this.formSubmitted = false;
          });
        }
      })
    
     


      // console.log('Payload:', payload);
      // this.records.push(payload);
      // this.createRecordForm.reset();
      // this.createModal.hide();
      // this.createRecordForm.get('status')!.setValue('Pending');
      // this.formSubmitted = false;

    }
  }

  editRecord(taskId: number, index: number){
    this.editingIndex = index;
    this.taskService.getTask(taskId).subscribe((task: Task)=>{
      this.editRecordForm.patchValue(task);
      this.editModal.show();
    }, (error)=>{
      this.toastService.showToastNotification(error, 'There was an error fetching the tasks details', '');
    }
    )
    
  }


  saveEditRecord(){
    if(this.editRecordForm.invalid){
      const errorMessages = this.getFormErrors(this.editRecordForm);
      this.toastService.showToastNotification('error', `Kindly Correct the errors highlighted to proceed: `, errorMessages);
      return;
    }
    this.sweetAlertService.showConfirmation('Confirmation', 'Do you wish to proceed updating record?').then((res)=>{
      if(res){
        const updatedRecord: Task ={
          id: this.records[this.editingIndex!].id,  // Ensure you include the id
          title: this.editRecordForm.get('title')!.value,
          description: this.editRecordForm.get('description')!.value,
          priority: this.editRecordForm.get('priority')!.value,
          dueDate: this.editRecordForm.get('dueDate')!.value,
          status: this.editRecordForm.get('status')!.value
        };
  
        this.taskService.updateTask(updatedRecord.id, updatedRecord).subscribe(
          (data) => {
            if(data){
              this.fetchRecord(); // Refresh the list of records
              this.editModal.hide(); // Hide the modal
              this.editRecordForm.reset();
              this.editingIndex = null; // Reset editing index
            }
        }, (error)=>{
              console.error('Error updating record:', error);
              this.toastService.showToastNotification('error', 'Error updating record. Please try again.', '');
        }
      );
      }
    })
  
  }

  toggleStatus(record: Task){
    const newStatus = record.status === 'Pending' ? 'Completed' : 'Pending';
     this.taskService.updateTask(record.id, { ...record, status: newStatus }).subscribe(
    () => {
      console.log('Task status updated successfully');
      record.status = newStatus;
    },
    (error) => {
      console.error('Error updating task status:', error);
      // Optionally revert status if update fails
      record.status = record.status === 'Pending' ? 'Completed' : 'Pending';
    }
  );
  }


  deleteRecord(index: number){
     const taskId = this.records[index].id;
      this.sweetAlertService.showConfirmation('Confirmation', 'Do you wish to proceed deleting record? This process is irreversible').then((res)=>{
        if(res){
      this.taskService.deleteTask(taskId).subscribe((res)=>{
        this.records.splice(index, 1);  // Remove the record from the frontend array
        this.toastService.showToastNotification('success', 'Successfully Deleted', '');
        this.fetchRecord();
      })
     }
    }, (error)=>{
        console.log("Error deleting the task: ", error);
    })
  }

  deleteInstanceRecord(){
    this.deleteModal.show()
  }




  //FORM VALIDATION ERRORS MESSAGE METHOD
  getFormErrors(form: FormGroup): string {
    let errors = '';
  
    for (const controlName in form.controls) {
      const control = form.controls[controlName];
  
      if (control.invalid && (control.dirty || control.touched)) {
        const controlErrors = control.errors;
        if (controlErrors) {
          for (const errorKey in controlErrors) {
            switch (errorKey) {
              case 'required':
                errors += `${this.formatFieldName(controlName)} can't be empty. `;
                break;
              case 'minlength':
                const minLength = controlErrors[errorKey].requiredLength;
                errors += `${this.formatFieldName(controlName)} must be at least ${minLength} characters long. `;
                break;
              case 'maxlength':
                const maxLength = controlErrors[errorKey].requiredLength;
                errors += `${this.formatFieldName(controlName)} cannot be more than ${maxLength} characters long. `;
                break;
              default:
                errors += `${this.formatFieldName(controlName)} has an invalid value. `;
                break;
            }
          }
        }
      }
    }
    return errors.trim();
  }
  
  
  private formatFieldName(fieldName: string): string {
    switch (fieldName) {
      case 'title':
        return 'Title';
      case 'description':
        return 'Description';
      case 'priority':
        return 'Priority';
      case 'dueDate':
        return 'Due Date';
      default:
        return fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace(/([A-Z])/g, ' $1');
    }
  }
  
 





}
