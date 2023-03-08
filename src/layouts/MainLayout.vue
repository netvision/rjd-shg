<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title> Self Help group </q-toolbar-title>

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
  console.log(user.value);
  let is_admin = [
    "rakesh@jangid.co.in",
    "jitendra.saini@dalmiatrusts.in",
  ].includes(user.value.email);
  user.value.is_admin = is_admin;
});
</script>
