<template>
  <q-page>
    <div class="row">
      <div class="q-pa-md col-12 col-md-5">
        <div class="q-pa-md">
          <q-list v-if="recentTransactions && recentTransactions.length > 0">
            <q-item class="bg-blue-2">
              <q-item-section class="text-h5">
                Recent Transactions
              </q-item-section>
            </q-item>
            <q-item v-for="trn in recentTransactions" :key="trn.id">
              <q-item-section>{{ trn.member.name }}</q-item-section>
              <q-item-section v-if="trn.loan_emi < 0">
                Amount Paid: &#8377;{{ Math.abs(trn.loan_emi) }}
              </q-item-section>
              <q-item-section v-else>
                Amount Recieved: &#8377;{{
                  +trn.contribution +
                  +trn.loan_emi +
                  +trn.interest_amt +
                  +trn.penalty
                }}</q-item-section
              >
              <q-item-section side>
                <span> <q-btn flat icon="delete" @click="delTrn(trn)" /></span>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </div>
      <div class="col-12 col-md-7">
        <q-list separator class="q-pa-md rounded-borders">
          <q-item class="bg-blue-2">
            <q-item-section class="text-h5"> Aggregates </q-item-section>
          </q-item>
          <q-item class="bg-blue-2">
            <q-item-section top>
              <q-item-label header class="text-h6"
                >Contribution: <br />&#8377;{{
                  totals.contribution
                }}</q-item-label
              >
              <q-item-label header class="text-h6"
                >Loan Given: <br />&#8377;{{ totals.loanTaken }}</q-item-label
              >
            </q-item-section>
            <q-item-section top>
              <q-item-label header class="text-h6"
                >Interest: <br />&#8377;{{ totals.interest }}</q-item-label
              >
              <q-item-label header class="text-h6"
                >Penalty: <br />&#8377;{{ totals.penalty }}</q-item-label
              >
            </q-item-section>
            <q-item-section side top>
              <q-item-label header class="text-h6"
                >Cash in hand: <br />&#8377;{{
                  totals.contribution +
                  totals.loan +
                  totals.interest +
                  totals.penalty
                }}</q-item-label
              >
              <q-item-label header class="text-red-5 text-h6"
                >Loan Pending:<br />
                &#8377;{{ Math.abs(totals.loan) }}</q-item-label
              >
            </q-item-section>
          </q-item>
        </q-list>
        <q-list separator class="q-pa-md rounded-borders bg-blue-1">
          <q-item>
            <q-item-section class="text-h5"> Members Status</q-item-section>
            <q-item-section
              side
              v-if="user && user.email === 'rakesh@jangid.co.in'"
            >
              <q-btn
                flat
                label="Add Member"
                @click="memberModal = true"
                color="primary"
              />
            </q-item-section>
          </q-item>
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
                    >Contribution: &#8377;{{ member.totals.contribution }}
                    <br />
                    <span
                      class="text-italic text-red-5"
                      v-if="member.totals.loan < 0"
                      >Loan: &#8377; {{ member.totals.loan }}
                    </span>
                  </q-item-label>
                </div>
              </q-item-section>
            </template>

            <q-card>
              <q-card-section class="q-pa-md">
                <q-table
                  :rows="member.transactions"
                  :columns="columns"
                  row-key="id"
                >
                  <template v-slot:top>
                    <q-item style="width: 100%">
                      <q-item-section>
                        <span class="text-subtitle1"
                          >{{ member.name }}
                          <q-btn
                            flat
                            icon="edit"
                            @click="editMember(member)"
                            v-if="
                              user &&
                              [
                                'rakesh@jangid.co.in',
                                'udaibhan39@gmail.com',
                              ].includes(user.email)
                            "
                        /></span>
                      </q-item-section>
                      <q-item-section
                        side
                        v-if="
                          user &&
                          [
                            'rakesh@jangid.co.in',
                            'udaibhan39@gmail.com',
                          ].includes(user.email)
                        "
                      >
                        <span
                          ><q-btn
                            flat
                            icon="event_repeat"
                            @click="newReciept(member)" />
                          <q-btn
                            flat
                            icon="currency_rupee"
                            @click="newLoan(member)"
                        /></span>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-table>
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </q-list>
      </div>
    </div>
    <q-dialog v-model="recieptModal">
      <new-receipt :member="curMember" @done="updatePage" />
    </q-dialog>
    <q-dialog v-model="memberModal">
      <q-card>
        <q-card-section>
          <div class="text-h6 text-center">
            {{
              curMember && curMember.id
                ? "Edit " + curMember?.name
                : "Add New Member"
            }}
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <div class="row">
            <div class="col q-pa-md">
              <q-input
                type="text"
                v-model="curMember.name"
                filled
                label="Full Name"
                stack-label
              ></q-input>
            </div>
          </div>
          <div class="row">
            <div class="col q-pa-md">
              <q-input
                filled
                v-model="curMember.date_of_joining"
                label="Date of Joining"
                stack-label
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy
                      ref="qDateProxy"
                      cover
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-date
                        v-model="curMember.date_of_joining"
                        mask="YYYY-MM-DD"
                      >
                        <div class="row items-center justify-end">
                          <q-btn
                            v-close-popup
                            label="Close"
                            color="primary"
                            flat
                          />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="col q-pa-md">
              <q-input
                type="text"
                v-model="curMember.mobile"
                filled
                label="Mobile No"
                stack-label
              ></q-input>
            </div>
          </div>
          <div class="row">
            <div class="col q-pa-md">
              <q-input
                type="text"
                v-model="curMember.email"
                filled
                label="Email Id"
                stack-label
              ></q-input>
            </div>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat @click="cancelMember"> Cancel</q-btn>
          <q-btn color="primary" class="q-mx-md" @click="saveMember">{{
            curMember.id ? "Update" : "Add"
          }}</q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="loanModal">
      <q-card>
        <q-card-section>
          <div class="text-h6 text-center">
            Loan Disbursement to
            {{ curMember.name }}
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <div class="row">
            <div class="col q-pa-md">
              <q-input filled v-model="loan.date" label="Date" stack-label>
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy
                      ref="qDateProxy"
                      cover
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-date v-model="loan.date" mask="YYYY-MM-DD">
                        <div class="row items-center justify-end">
                          <q-btn
                            v-close-popup
                            label="Close"
                            color="primary"
                            flat
                          />
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
                type="text"
                v-model="loan.loan_emi"
                filled
                label="Amount"
                stack-label
              ></q-input>
            </div>
          </div>
          <div class="row">
            <div class="col q-pa-md">
              <q-input
                type="text"
                v-model="loan.interest_rate"
                filled
                label="Interest Rate"
                stack-label
              ></q-input>
            </div>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat @click="cancelLoan"> Cancel</q-btn>
          <q-btn color="primary" class="q-mx-md" @click="saveLoan">Save</q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { api } from "../boot/axios";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import NewReceipt from "./../components/NewReceipt.vue";
import { date, useQuasar } from "quasar";
const $q = useQuasar();
const totals = ref({});
const groupMembers = ref([]);
const user = ref({});
const recentTransactions = ref([]);
const recieptModal = ref(false);
const columns = ref([
  { name: "date", label: "Date", field: "date" },
  { name: "contribution", label: "Contribution", field: "contribution" },
  { name: "loan", label: "Loan/EMI", field: "loan_emi" },
  { name: "interest", label: "Interest", field: "interest_amt" },
  { name: "penalty", label: "Penalty", field: "penalty" },
]);
const curMember = ref({});
const newReciept = (member) => {
  curMember.value = member;
  recieptModal.value = true;
};

const memberModal = ref(false);
const editMember = (member) => {
  curMember.value = member;
  console.log(curMember.value);
  memberModal.value = true;
};

const cancelMember = () => {
  curMember.value = {};
  memberModal.value = false;
};

const saveMember = async () => {
  let mem = curMember.value;
  let res = mem.id
    ? await api.put("shg-members/" + mem.id, mem)
    : await api.post("shg-members", mem);

  if (res.status == 200) {
    $q.notify("Updated successfully");
    curMember.value = {};
    memberModal.value = false;
  } else if (res.status == 201) {
    $q.notify("new member added successfully");
    groupMembers.value.push({ ...res.data, totals: {}, transactions: [] });
    curMember.value = {};
    memberModal.value = false;
  } else {
    $q.notify(res.statusText);
  }
};

const loan = ref({});
const loanModal = ref(false);
const newLoan = (member) => {
  curMember.value = member;
  loanModal.value = true;
};

const cancelLoan = () => {
  curMember.value = {};
  loanModal.value = false;
};

const saveLoan = async () => {
  loan.value.member_id = curMember.value.id;
  loan.value.loan_emi = -loan.value.loan_emi;
  let res = await api.post("shg-transactions-logs", loan.value);
  if (res.status == "201") {
    $q.notify("transaction updated successfully");
    recentTransactions.value.push({ ...res.data, member: curMember.value });
    curMember.value = {};
    loanModal.value = false;
    getData();
  } else $q.notify(res.statusText);
};

const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const removeListener = onAuthStateChanged(
      getAuth(),
      (user) => {
        removeListener();
        resolve(user);
      },
      reject
    );
  });
};

const updatePage = (done) => {
  console.log(done);
  recentTransactions.value.push(done);
  getData();
  recieptModal.value = false;
};

const delTrn = async (trn) => {
  let res = await api.delete("shg-transactions-logs/" + trn.id);
  if (res.status == 204) {
    $q.notify("Deleted successfully!");
    recentTransactions.value.splice(
      recentTransactions.value.findIndex((tr) => tr.id === trn.id),
      1
    );
    getData();
  } else {
    $q.notify(res.statusText);
  }
};
const getData = async () => {
  let members = await api
    .get("shg-member?expand=transactions")
    .then((r) => r.data);

  members.forEach((member) => {
    member.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    member.totals = member.transactions.reduce(
      (a, b) => {
        a.interest += b.interest_amt;
        a.contribution += b.contribution;
        a.loan += b.loan_emi;
        a.loanTaken += b.loan_emi < 0 ? Math.abs(b.loan_emi) : 0;
        a.penalty += b.penalty;
        return a;
      },
      {
        contribution: 0,
        loan: 0,
        loanTaken: 0,
        interest: 0,
        penalty: 0,
      }
    );
  });

  groupMembers.value = members;
  totals.value = members.reduce(
    (a, b) => {
      a.interest += b.totals.interest;
      a.contribution += b.totals.contribution;
      a.loan += b.totals.loan;
      a.loanTaken += b.totals.loanTaken;
      a.penalty += b.totals.penalty;
      return a;
    },
    {
      contribution: 0,
      loan: 0,
      loanTaken: 0,
      interest: 0,
      penalty: 0,
    }
  );
};

onMounted(async () => {
  user.value = await getCurrentUser();

  getData();
});
</script>
