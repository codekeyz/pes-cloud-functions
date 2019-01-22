export async function updateBranch(
  database: FirebaseFirestore.Firestore,
  branchId: string,
  data: {}
) {
  await database
    .collection('Branches')
    .doc(branchId)
    .update(data);
  return true;
}

export async function updateTransaction(
  database: FirebaseFirestore.Firestore,
  transId: string,
  data: {}
) {
  await database
    .collection('Transactions')
    .doc(transId)
    .update(data);
  return true;
}

export async function processTransactionsInday(
  database: FirebaseFirestore.Firestore,
  dayId: string
) {
  const datalist = await database
    .collection('Transactions')
    .where('day', '==', dayId)
    .get();

  let totalBranchAmountforDay = 0;
  const opts = datalist.docs.map(trans => {
    const data = trans.data();
    const amount: number = data.amount || 0;
    return (totalBranchAmountforDay = totalBranchAmountforDay + amount);
  });

  await Promise.all(opts);

  const dataMap = {
    totalAmount: totalBranchAmountforDay
  };

  return database
    .collection('Days')
    .doc(dayId)
    .update(dataMap);
}
