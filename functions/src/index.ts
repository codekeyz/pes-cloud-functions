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
  .onUpdate((snap, event) => {
    const oldData: any = snap.before.data();
    const newData: any = snap.after.data();
    const oldStatus = oldData.isAccountConfirmed;
    const newStatus = newData.isAccountConfirmed;
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

    const uid = event.params.managerID;
    const branchID = data.branchID;

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

    const amount = data.amount;
    const uid = event.params.transactionID;
    const branchName = data.branchName;

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
  .onCreate((snap, event) => {
    const transData: any = snap.data();
    const day = transData.day;
    const week = transData.week;
    return processTransactionsInday(databaseInstance, day).then(() => {
      return processTransactionsInWeek(databaseInstance, week);
    });
  });
