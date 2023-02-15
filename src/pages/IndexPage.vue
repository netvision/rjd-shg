<template>
  <q-page class="flex flex-top justify-center">
    <div class="q-pa-md">
      <h3 class="text-h4">Aggregates</h3>
      <div class="q-pa-md text-left">
        <p>Contribution Recieved: &#8377;{{ totals.contribution }}</p>
        <p>Loan Distributed: &#8377;{{ -totals.totalLoan }}</p>
        <p>Loan Recovered: &#8377;{{ totals.loan - totals.totalLoan }}</p>
        <p>Interest: &#8377;{{ totals.interest }}</p>
        <p>Penalty: &#8377;{{ totals.penalty }}</p>
        <q-separator />
        <p>
          Cash in hand: &#8377;{{
            totals.contribution + totals.loan + totals.interest + totals.penalty
          }}
        </p>
        <q-separator />
      </div>
    </div>
    <q-list separator class="q-pa-md rounded-borders">
      <q-expansion-item v-for="member in groupMembers" :key="member.id">
        <template v-slot:header>
          <q-item-section avatar>
            <q-avatar
              icon="account_circle"
              color="primary"
              text-color="white"
            />
          </q-item-section>

          <q-item-section>
            {{ member.name }}
          </q-item-section>

          <q-item-section>
            <div class="row items-center">
              <q-item-label
                >Contribution: &#8377;{{
                  member.totals.contribution
                }}</q-item-label
              >
              <q-item-label v-if="member.totals.loan < 0"
                ><span class="text-italic text-red-5"
                  >Loan: &#8377; {{ member.totals.loan }}</span
                ></q-item-label
              >
            </div>
          </q-item-section>
        </template>

        <q-card>
          <q-card-section class="q-pa-md">
            <q-table
              :title="member.name + '\'s contributions'"
              :rows="member.transactions"
              :columns="columns"
              row-key="id"
            />
          </q-card-section>
        </q-card>
      </q-expansion-item>
    </q-list>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { api } from "../boot/axios";

const totals = ref({});
const groupMembers = ref([]);

const columns = ref([
  { name: "month", label: "Month", field: "month" },
  { name: "contribution", label: "Contribution", field: "contribution" },
  { name: "loan", label: "Loan/EMI", field: "loan_emi" },
  { name: "interest", label: "Interest", field: "interest_amt" },
  { name: "penalty", label: "Penalty", field: "penalty" },
]);

onMounted(async () => {
  let res = await api.get("shg-transactions-log").then((r) => r.data);
  let members = await api
    .get("shg-member?expand=transactions")
    .then((r) => r.data);
  members.forEach((member) => {
    member.totals = member.transactions.reduce(
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
  });
  groupMembers.value = members;
  totals.value = res.reduce(
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
  let totalLoan = res
    .filter((tr) => tr.loan_emi < 0)
    .reduce((t, c) => {
      return t + c.loan_emi;
    }, 0);
  totals.value.totalLoan = totalLoan;
});
</script>
