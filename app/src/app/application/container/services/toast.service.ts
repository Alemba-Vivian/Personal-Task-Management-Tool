import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toastoptions = {
    timeOut: 5000,
    closeButton:true,
    tapToDismiss:true
  };

  constructor(private toast: ToastrService) { }
  showToastNotification(alertype:any,title:any,message:any){
    if(alertype == 'success'){
      this.toast.success(title, message,this.toastoptions);
    }
    else if(alertype == 'error'){
      this.toast.error(title, message,this.toastoptions);
  
    }
    else if(alertype == 'warning'){
      this.toast.warning(title, message,this.toastoptions);
  
    }
    else if(alertype == 'info'){
      this.toast.info(title, message,this.toastoptions);
  
    }
    else {
      this.toast.show(title, message,this.toastoptions);
  
    }
    
  
  }
}
