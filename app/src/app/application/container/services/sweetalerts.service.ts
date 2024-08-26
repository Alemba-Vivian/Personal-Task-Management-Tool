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
    icon: alertype,
    customClass: {
      container: 'custom-swal-container'
    }
  })

}
showConfirmation(title:any,message:any){
  return new Promise((resolve, reject) =>{
    Swal.fire({
      title: title,
      text:message,
      icon:'warning',
      showCancelButton: true,
      confirmButtonColor: '#B4C424',
      cancelButtonColor: '#171717',
      confirmButtonText: 'Yes,Proceed',
      customClass: {
        container: 'custom-swal-container'
      }
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
