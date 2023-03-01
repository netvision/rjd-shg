<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title> Self Help group </q-toolbar-title>
        <q-fab
          icon="add"
          outline
          square
          dense
          direction="down"
          label="Add"
          v-if="user && user.is_admin"
          vertical-actions-align="left"
          padding="xs"
        >
          <q-fab-action
            square
            color="primary"
            to="/add-member"
            label="New Member"
            icon="person_add"
          />
          <q-fab-action
            square
            color="primary"
            to="/add-transaction"
            label="Reciept"
            icon="event_repeat"
          />
          <q-fab-action
            square
            color="primary"
            to="/add-loan"
            label="Loan"
            icon="currency_rupee"
          />
        </q-fab>
        <q-btn outline dense icon="home" to="/" class="q-mx-md" />
        <q-avatar v-if="user" class="q-mx-md">
          <img :src="user.photoURL" />
        </q-avatar>

        <q-btn v-if="user" flat dense icon="logout" @click="logout" />
      </q-toolbar>
    </q-header>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
const router = useRouter();
const user = ref();

const fabPos = ref([50, 50]);
const draggingFab = ref(false);

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

const logout = () => {
  const auth = getAuth();
  signOut(auth)
    .then(() => {
      alert("logged out");
      router.push("/login");
    })
    .catch((error) => {
      alert(error.message);
    });
};

onMounted(async () => {
  user.value = await getCurrentUser();
  let is_admin = [
    "rakesh@jangid.co.in",
    "jitendra.saini@dalmiatrusts.in",
  ].includes(user.value.email);
  user.value.is_admin = is_admin;
});
</script>
