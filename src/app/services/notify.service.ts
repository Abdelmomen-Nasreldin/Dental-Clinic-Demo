import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class NotifyService {

  constructor() { }

  showSuccessAlert() {
    return Swal.fire({
      title: 'Success!',
      text: 'Operation completed.',
      icon: 'success',
      showConfirmButton: false,
      timer: 1000, // 1 second
      timerProgressBar: true
    })
  }

  showErrorAlert(err?: any) {
    return Swal.fire({
      title: 'Error!',
      text: 'Operation failed.',
      icon: 'error',
    })
  }

  showConfirmAlert( icon: 'success' | 'error' | 'warning' | 'info' | 'question') {
    return Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      icon: icon,
      showConfirmButton: true,
      showCancelButton: true,
    })
  }
}
