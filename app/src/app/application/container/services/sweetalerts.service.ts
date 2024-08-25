import { Injectable } from '@angular/core';
import Swal from 'sweetalert2'
@Injectable({
  providedIn: 'root'
})
export class SweetalertService {

  constructor() { }

showAlert(title:any,message:any,alertype:any){
  // Swal.fire(title, message,alertype);

  Swal.fire({
    title: title,
    text: message,
    icon: alertype
  })

}
showConfirmation(title:any,message:any){
  return new Promise((resolve, reject) =>{
    Swal.fire({
      title: title,
      text:message,
      icon:'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes,Proceed'
    }).then((result) => {
      if (result.value) {
        resolve(true);
      }
      else{
        reject(false);
      }
    },(err)=>{
      reject(false);

    });



  });
 

}



}
