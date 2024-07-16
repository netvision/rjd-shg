const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("pages/IndexPage.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "add-transaction",
        component: () => import("pages/AddTransaction.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "add-loan",
        component: () => import("pages/AddLoan.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "add-member",
        component: () => import("src/pages/NewMember.vue"),
        meta: { requiresAuth: true },
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
  {
    path: "/login",
    component: () => import("pages/LoginPage.vue"),
  },
];

export default routes;
