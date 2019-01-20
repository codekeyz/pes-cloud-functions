import * as admin from 'firebase-admin';

export async function updateBranch(branchId: string, data: {}) {
  await admin
    .firestore()
    .collection('Branches')
    .doc(branchId)
    .update(data);
  return true;
}

export async function updateTransaction(transId: string, data: {}) {
  await admin
    .firestore()
    .collection('Transactions')
    .doc(transId)
    .update(data);
  return true;
}
