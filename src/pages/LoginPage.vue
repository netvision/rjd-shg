<template>
  <div class="full-height column q-pa-xl">
    <q-btn @click="signIn" label="Sign In With Google" class="self-center" />
  </div>
</template>
<script setup>
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { useRouter } from "vue-router";
const router = useRouter();
const signIn = () => {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then((result) => {
      const user = result.user;
      router.push("/");
    })
    .catch((error) => {
      const errorCode = error.code;
      alert(error.message);
    });
};
</script>
