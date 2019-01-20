import * as admin from 'firebase-admin';

export async function updateBranch(branchId: string, data: {}) {
  await admin
    .firestore()
    .collection('Branches')
    .doc(branchId)
    .update(data);
  return true;
}
