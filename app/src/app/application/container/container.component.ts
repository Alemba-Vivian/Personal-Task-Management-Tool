import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { CreateTaskPayload, Task } from './interfaces/application';
import { Router } from '@angular/router';
import { TaskService } from './services/todos.service';
import { SweetalertService } from './services/sweetalerts.service';

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
      alert("Kindly correct those errors to proceed")
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
      console.log("Error Fetching Task:", error);
      alert("There was an error fetching the tasks details");
    }
    )
    
  }


  saveEditRecord(){
    if(this.editRecordForm.invalid){
      alert("Please correct those errors before saving");
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
  
        this.taskService.updateTask(updatedRecord.id, updatedRecord).subscribe(() => {
          this.fetchRecord(); // Refresh the list of records
          this.editModal.hide(); // Hide the modal
          this.editRecordForm.reset();
          this.editingIndex = null; // Reset editing index
        });
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

 
 





}
