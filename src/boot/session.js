import { ref } from "vue";
import { api, setCsrfToken } from "./axios";

export const user = ref(null);
function applySession(data) {
  user.value = data;
  setCsrfToken(data?.csrf_token || null);
  return data;
}
export async function restoreSession() {
  try {
    return applySession((await api.get("auth/me")).data);
  } catch (error) {
    applySession(null);
    if (error.response?.status !== 401) throw error;
    return null;
  }
}
export async function login(username, password) {
  return applySession(
    (await api.post("auth/login", { username, password })).data
  );
}
export async function changePassword(currentPassword, newPassword) {
  await api.post("auth/change-password", {
    current_password: currentPassword,
    new_password: newPassword,
  });
  applySession(null);
}
export async function logout() {
  try {
    await api.post("auth/logout");
  } catch (error) {
    if (error.response?.status !== 401) throw error;
  }
  applySession(null);
}
