<template>
  <div class="window-height row items-center justify-center q-pa-md bg-grey-2">
    <q-card style="width: 100%; max-width: 400px">
      <q-card-section>
        <div class="text-h5">Self Help Group</div>
        <div class="text-subtitle2 q-mt-sm">
          {{
            changing
              ? "Change your temporary password"
              : "Administrator sign in"
          }}
        </div>
      </q-card-section>
      <q-card-section>
        <q-form @submit="submit" class="q-gutter-md">
          <q-input
            v-if="!changing"
            v-model="username"
            label="Username"
            autocomplete="username"
            outlined
            :rules="[(v) => !!v || 'Enter your username']"
          />
          <q-input
            v-model="password"
            :label="changing ? 'Current password' : 'Password'"
            type="password"
            autocomplete="current-password"
            outlined
            :rules="[(v) => !!v || 'Enter your password']"
          />
          <template v-if="changing">
            <q-input
              v-model="newPassword"
              label="New password"
              type="password"
              autocomplete="new-password"
              outlined
              :rules="[(v) => v.length >= 12 || 'Use at least 12 characters']"
            />
            <q-input
              v-model="confirmation"
              label="Confirm new password"
              type="password"
              autocomplete="new-password"
              outlined
              :rules="[(v) => v === newPassword || 'Passwords must match']"
            />
          </template>
          <q-banner v-if="error" class="bg-red-1 text-negative" role="alert">{{
            error
          }}</q-banner>
          <q-banner
            v-if="message"
            class="bg-green-1 text-positive"
            role="status"
            >{{ message }}</q-banner
          >
          <q-btn
            type="submit"
            color="primary"
            class="full-width"
            :label="changing ? 'Change password' : 'Sign in'"
            :loading="busy"
          />
          <q-btn
            v-if="changing"
            flat
            label="Sign out"
            @click="cancel"
            :disable="busy"
          />
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { login, restoreSession, changePassword, logout } from "../boot/session";
const router = useRouter();
const username = ref("");
const password = ref("");
const newPassword = ref("");
const confirmation = ref("");
const changing = ref(false);
const busy = ref(false);
const error = ref("");
const message = ref("");
function showError(err) {
  const detail = err.response?.data?.detail;
  error.value =
    typeof detail === "string"
      ? detail
      : "Unable to connect. Please try again.";
}
async function submit() {
  if (busy.value) return;
  busy.value = true;
  error.value = "";
  message.value = "";
  try {
    if (changing.value) {
      await changePassword(password.value, newPassword.value);
      changing.value = false;
      newPassword.value = "";
      confirmation.value = "";
      message.value = "Password changed. Sign in with your new password.";
    } else {
      const current = await login(username.value, password.value);
      changing.value = current.must_change_password;
      if (!changing.value) await router.replace("/");
    }
    password.value = "";
  } catch (err) {
    showError(err);
    if (err.response?.status === 401 && changing.value) changing.value = false;
  } finally {
    busy.value = false;
  }
}
async function cancel() {
  try {
    await logout();
    changing.value = false;
    password.value = "";
  } catch (err) {
    showError(err);
  }
}
onMounted(async () => {
  busy.value = true;
  try {
    const current = await restoreSession();
    if (current?.must_change_password) changing.value = true;
    else if (current) await router.replace("/");
  } catch (err) {
    showError(err);
  } finally {
    busy.value = false;
  }
});
</script>
