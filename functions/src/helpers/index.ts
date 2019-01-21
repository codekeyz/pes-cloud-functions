import * as admin from 'firebase-admin';

const firestore = admin.firestore();

export async function updateBranch(branchId: string, data: {}) {
  await firestore
    .collection('Branches')
    .doc(branchId)
    .update(data);
  return true;
}

export async function updateTransaction(transId: string, data: {}) {
  await firestore
    .collection('Transactions')
    .doc(transId)
    .update(data);
  return true;
}

export async function processTransactionsInday(
  dayId: string,
  branchId: string
) {
  const datalist = await firestore
    .collection('Transactions')
    .where('day', '==', dayId)
    .get();

  let totalBranchAmountforDay = 0;
  await datalist.forEach(data => {
    const transData: any = data.data();
    (totalBranchAmountforDay = totalBranchAmountforDay + transData.amount);
  });

  

}
