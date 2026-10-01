import { boot } from "quasar/wrappers";
import axios from "axios";
import { Notify } from "quasar";

const api = axios.create({ baseURL: "/api/", withCredentials: true });
let csrfToken = null;
export function setCsrfToken(token) {
  csrfToken = token;
}
api.interceptors.request.use((config) => {
  if (
    !["get", "head", "options"].includes(
      (config.method || "get").toLowerCase()
    ) &&
    csrfToken
  ) {
    config.headers["X-CSRF-Token"] = csrfToken;
  }
  return config;
});

export async function getMembers() {
  const members = [];
  let page = 1;
  let pages = 1;
  do {
    const response = await api.get("shg-member", {
      params: { expand: "transactions", "per-page": 100, page },
    });
    members.push(...response.data);
    pages = Number(response.headers["x-pagination-page-count"] || 1);
    page++;
  } while (page <= pages);
  return members;
}

export default boot(({ app, router }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status;
      const detail = error.response?.data?.detail;
      const authRequest = error.config?.url?.startsWith("auth/");
      if (!authRequest) {
        Notify.create({
          type: "negative",
          message:
            typeof detail === "string"
              ? detail
              : "Request failed. Please try again.",
        });
        if (status === 401 || detail === "Password change required") {
          setCsrfToken(null);
          router.replace("/login");
        }
      }
      return Promise.reject(error);
    }
  );
});
export { api, axios };
