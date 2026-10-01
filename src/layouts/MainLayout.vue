<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>Self Help Group</q-toolbar-title>
        <q-btn
          outline
          dense
          icon="home"
          to="/"
          class="q-mx-md"
          aria-label="Home"
        />
        <span v-if="user" class="q-mr-md">{{ user.username }}</span>
        <q-btn
          v-if="user"
          flat
          dense
          icon="logout"
          @click="signOut"
          :loading="busy"
          aria-label="Sign out"
        />
      </q-toolbar>
    </q-header>
    <q-page-container><router-view /></q-page-container>
  </q-layout>
</template>
<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { user, logout } from "../boot/session";
const router = useRouter();
const $q = useQuasar();
const busy = ref(false);
async function signOut() {
  busy.value = true;
  try {
    await logout();
    await router.replace("/login");
  } catch {
    $q.notify({
      type: "negative",
      message: "Sign out failed. Please try again.",
    });
  } finally {
    busy.value = false;
  }
}
</script>
