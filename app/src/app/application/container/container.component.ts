import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Task } from './interfaces/application';

@Component({
  selector: 'app-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.css']
})
export class ContainerComponent implements OnInit {

     public createRecordForm: FormGroup;
     formSubmitted =false;
      
     records: Task[] =[];
     previous: string | null;

   constructor(private formbuilder: FormBuilder) {
    this.createRecordForm = this.formbuilder.group({
      title: new FormControl('', Validators.compose([Validators.required, Validators.minLength(2)])),
      description: new FormControl('', Validators.compose([Validators.required, Validators.minLength(2)])),
      priority: new FormControl('', Validators.compose([Validators.required, Validators.minLength(2)])),
      dueDate: new FormControl('', Validators.compose([Validators.required, Validators.minLength(2)])),
    
    })

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

  }


  createRecord(){
    if(this.createRecordForm.invalid){
      this.formSubmitted = true;
      alert("Kindly correct those errors to proceed")
    }else{
      const payload: Task = {
        title: this.createRecordForm.get('title')!.value,
        description:this.createRecordForm.get('description')!.value,
        priority:this.createRecordForm.get('priority')!.value,
        dueDate:this.createRecordForm.get('dueDate')!.value,
      }
      console.log('Payload:', payload);
      this.records.push(payload);
      this.createRecordForm.reset();
      this.formSubmitted = false;

    }
  }

  fetchRecord(){
    const params = {}
  }





}
