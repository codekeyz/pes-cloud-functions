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
  // Get All Transactions in this Day -> {dayId}
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

  // Wait for calculation to finish
  await Promise.all(opts);

  const dataMap = {
    totalAmount: totalBranchAmountforDay
  };

  // Write the total to the Day Model
  return database
    .collection('Days')
    .doc(dayId)
    .update(dataMap);
}

export async function processTransactionsInWeek(
  database: FirebaseFirestore.Firestore,
  weekId: string
) {
  // Get All Days in Week -> {weekId}
  const datalist = await database
    .collection('Days')
    .where('weekID', '==', weekId)
    .get();

  let totalBranchAmountforWeek = 0;
  const opts = datalist.docs.map(trans => {
    const data = trans.data();
    const amount: number = data.totalAmount || 0;
    return (totalBranchAmountforWeek = totalBranchAmountforWeek + amount);
  });

  // Wait for calculation to finish
  await Promise.all(opts);

  const dataMap = {
    totalAmount: totalBranchAmountforWeek
  };

  // Write the total to the Week Model
  return database
    .collection('Weeks')
    .doc(weekId)
    .update(dataMap);
}

export async function processTransactionsInMonth(
  database: FirebaseFirestore.Firestore,
  monthId: string
) {
  // Get All Weeks in Month -> {monthId}
  const datalist = await database
    .collection('Weeks')
    .where('monthID', '==', monthId)
    .get();

  let totalBranchAmountforMonth = 0;
  const opts = datalist.docs.map(trans => {
    const data = trans.data();
    const amount: number = data.totalAmount || 0;
    return (totalBranchAmountforMonth = totalBranchAmountforMonth + amount);
  });

  // Wait for calculation to finish
  await Promise.all(opts);

  const dataMap = {
    totalAmount: totalBranchAmountforMonth
  };

  // Write the total to the Month Model
  return database
    .collection('Months')
    .doc(monthId)
    .update(dataMap);
}
