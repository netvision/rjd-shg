<template>
  <q-select
    v-model="member"
    filled
    :options="members"
    label="Select Member"
    option-label="name"
    option-value="id"
    @update:model-value="getTransactions"
  />
  <pre>{{ lastTransaction }}</pre>
  <pre>{{ curStatus }}</pre>
  <pre>{{ loanTaken }}</pre>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { api } from "../boot/axios";
const members = ref([]);
const member = ref();
const lastTransaction = ref();
const loanTaken = ref();
const curStatus = ref();
const getTransactions = (v) => {
  let transactions = v.transactions.sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
  lastTransaction.value = transactions[0];
  curStatus.value = transactions.reduce(
    (a, b) => {
      a.interest += b.interest_amt;
      a.contribution += b.contribution;
      a.loan += b.loan_emi;
      a.penalty += b.penalty;
      return a;
    },
    {
      contribution: 0,
      loan: 0,
      interest: 0,
      penalty: 0,
    }
  );
  let loan = transactions.filter((tr) => tr.loan_emi < 0);
  loanTaken.value = loan.length > 0 ? loan[0] : {};
  calculateInterest();
};

const calculateInterest = () => {
  let curDate = new Date("2023-03-10");
  let lastTrnDate = new Date(lastTransaction.value.date);
  let monthDiff =
    curDate.getMonth() -
    lastTrnDate.getMonth() +
    12 * (curDate.getFullYear() - lastTrnDate.getFullYear());
  let interest =
    Math.abs(curStatus.value.loan) > 0 && monthDiff > 0
      ? (Math.abs(curStatus.value.loan) *
          monthDiff *
          loanTaken.value.interest_rate) /
        1200
      : 0;
  console.log(interest);
};

onMounted(async () => {
  members.value = await api
    .get("shg-member?expand=transactions")
    .then((r) => r.data);

  //member.value = members.value[0];
});
</script>
