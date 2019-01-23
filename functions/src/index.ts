import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {
  updateBranch,
  updateTransaction,
  processTransactionsInday,
  processTransactionsInWeek
} from './helpers';

admin.initializeApp(functions.config().firebase);

const databaseInstance = admin.firestore();

export const sendManagerStatusChangedNotification = functions.firestore
  .document('Managers/{managerID}')
  .onUpdate((snap, _) => {
    const oldData: any = snap.before.data();
    const newData: any = snap.after.data();
    const oldStatus: boolean = oldData.isAccountConfirmed;
    const newStatus: boolean = newData.isAccountConfirmed;
    const token: string = newData.myToken;
    const branchName = newData.branchName;
    let message = '';
    if (oldStatus !== newStatus && token && token.length > 0) {
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

export const deleteManagerAuthAccount = functions.firestore
  .document('Managers/{managerID}')
  .onDelete((snap, event) => {
    const data: any = snap.data();

    const uid: string = event.params.managerID;
    const branchID: string = data.branchID;

    const dataMap = {
      branchManagerID: null,
      isBranchActive: false
    };

    return updateBranch(databaseInstance, branchID, dataMap).then(isdone => {
      return admin.auth().deleteUser(uid);
    });
  });

export const sendTransactionNotification = functions.firestore
  .document('Transactions/{transactionID}')
  .onCreate((snap, event) => {
    const data: any = snap.data();

    const amount: number = data.amount;
    const uid: string = event.params.transactionID;
    const branchName: string = data.branchName;

    const dataMap = {
      createdAt: new Date()
    };
    const payload = {
      data: {
        title: 'Transaction Notification',
        message: `${branchName} has just been added a new contribution worth GH¢${amount}`
      }
    };

    return updateTransaction(databaseInstance, uid, dataMap).then(isdone => {
      return admin.messaging().sendToTopic('Transactions', payload);
    });
  });

export const calculateAndUpdateTransactionTimelines = functions.firestore
  .document('Transactions/{transactionID}')
  .onUpdate((snap, _) => {
    const transData: any = snap.after.data();
    const day: string = transData.day;
    const week: string = transData.week;
    return processTransactionsInday(databaseInstance, day).then(() => {
      return processTransactionsInWeek(databaseInstance, week);
    });
  });
