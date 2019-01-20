import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp(functions.config().firebase);

const databaseInstance = admin.firestore();

export const sendManagerStatusChangedNotification = functions.firestore
  .document('Managers/{managerID}')
  .onUpdate((snap, event) => {
    const oldData: any = snap.before.data();
    const newData: any = snap.after.data();
    const oldStatus = oldData.isAccountConfirmed;
    const newStatus = newData.isAccountConfirmed;
    const token = newData.myToken;
    const branchName = newData.branchName;
    let message = '';
    if (oldStatus !== newStatus && token !== null) {
      if (newStatus === true) {
        message = `Your account has been activated, You are the manager for ${branchName}`;
      } else {
        message =
          'Your account has been deactivated, Contact Administrator for more info';
      }

      const payload = {
        data: {
          title: 'Account Status Notification',
          message: message
        }
      };

      return admin.messaging().sendToDevice(token, payload);
    } else {
      return false;
    }
  });
