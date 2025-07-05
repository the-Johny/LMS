import { Injectable } from '@angular/core';

export enum ModalType {
  None,
  Login,
  Register,
}

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private activeModal: ModalType = ModalType.None;

  openLogin() {
    this.activeModal = ModalType.Login;
  }

  openRegister() {
    this.activeModal = ModalType.Register;
  }

  closeModals() {
    this.activeModal = ModalType.None;
  }

  isLoginOpen(): boolean {
    return this.activeModal === ModalType.Login;
  }

  isRegisterOpen(): boolean {
    return this.activeModal === ModalType.Register;
  }

  isAnyModalOpen(): boolean {
    return this.activeModal !== ModalType.None;
  }
}
