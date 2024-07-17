<template>
  <q-card>
    <q-card-section>
      <div class="text-h6 text-center">Reciept from {{ member.name }}</div>
    </q-card-section>
    <q-separator />
    <q-card-section>
      <div class="row">
        <div class="col-5 q-pa-md">
          <q-input
            filled
            v-model="newTrn.date"
            label="Date"
            stack-label
            @blur="calcTrn"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy
                  ref="qDateProxy"
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date v-model="newTrn.date" mask="YYYY-MM-DD">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
      </div>
      <div class="row">
        <div class="col q-pa-md">
          <q-input
            type="number"
            v-model="newTrn.contribution"
            filled
            label="Contribution"
            stack-label
          ></q-input>
        </div>
        <div class="col q-pa-md">
          <q-input
            type="number"
            v-model="newTrn.penalty"
            filled
            label="Penalty if any!"
            stack-label
          ></q-input>
        </div>
      </div>
      <div class="row">
        <div class="col q-pa-md">
          <q-input
            type="number"
            v-model="newTrn.loan_emi"
            filled
            label="Loan EMI"
            stack-label
          ></q-input>
        </div>
        <div class="col q-pa-md">
          <q-input
            type="number"
            v-model="newTrn.interest_amt"
            filled
            label="Interest"
            stack-label
          ></q-input>
        </div>
      </div>
    </q-card-section>
    <q-separator />

    <q-card-actions align="right" class="q-pa-md">
      <q-btn flat>Total Reciept: &#8377;{{ totalReciept }}</q-btn>
      <q-btn color="primary" class="q-mx-md" @click="saveReceipt">Save</q-btn>
    </q-card-actions>
  </q-card>
</template>
<script setup>
import { ref, watch, reactive, onMounted } from "vue";
import { date, useQuasar } from "quasar";
import { api } from "../boot/axios";
const props = defineProps({
  member: Object,
});

const member = ref(props.member);
const lastTransaction = ref();
const loanTaken = ref();
const curStatus = ref({});
const totalReciept = ref(0);
const $q = useQuasar();

const curDate = ref(new Date());

const newTrn = reactive({
  date: date.formatDate(new Date(), "YYYY-MM-DD"),
  contribution: 500,
  loan_emi: 0,
  interest_amt: 0,
  penalty: 0,
});

watch(newTrn, () => {
  totalReciept.value =
    +newTrn.contribution +
    +newTrn.loan_emi +
    +newTrn.interest_amt +
    +newTrn.penalty;
});

const calcTrn = () => {
  curDate.value = new Date(newTrn.date);
  let lastTrnDate =
    lastTransaction.value && lastTransaction.value.date
      ? new Date(lastTransaction.value.date)
      : new Date(member.value.date_of_joining);
  let monthDiff =
    curDate.value.getMonth() -
    lastTrnDate.getMonth() +
    12 * (curDate.value.getFullYear() - lastTrnDate.getFullYear());

  if (Math.abs(curStatus.value.loan) > 0 && monthDiff > 0) {
    newTrn.interest_amt =
      (Math.abs(curStatus.value.loan) *
        monthDiff *
        loanTaken.value.interest_rate) /
      1200;
    let loan_emi = (Math.abs(loanTaken.value.loan_emi) * monthDiff) / 10;
    newTrn.loan_emi =
      loan_emi < Math.abs(curStatus.value.loan)
        ? loan_emi
        : Math.abs(curStatus.value.loan);
  } else {
    (newTrn.tranDate = date.formatDate(new Date(), "YYYY-MM-DD")),
      (newTrn.interest_amt = 0);
    newTrn.loan_emi = 0;
  }
  newTrn.contribution = monthDiff > 0 ? monthDiff * 500 : 0;

  newTrn.member_id = member.value.id;
  console.log(newTrn);
};

const emit = defineEmits("done");

const saveReceipt = async () => {
  let res = await api.post("shg-transactions-logs", newTrn);
  if (res.status == "201") {
    $q.notify("Payment updated successfully!");
    emit("done", { ...res.data, member: member.value });
  } else {
    $q.notify(res.statusText);
  }
};

onMounted(() => {
  member.value = props.member;
  let trns = ref(props.member.transactions);
  let transactions = trns.value.sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
  lastTransaction.value = transactions[0];
  let loan = transactions.filter((tr) => tr.loan_emi < 0);
  loanTaken.value = loan.length > 0 ? loan[0] : {};
  curStatus.value = props.member.totals;
});
</script>
