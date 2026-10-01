import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { SourceTextModule, SyntheticModule, createContext } from "node:vm";
import test from "node:test";

async function setup() {
  let requestHook;
  let failureHook;
  let responder;
  const requests = [];
  const redirects = [];
  const context = createContext({ console });
  const client = {
    interceptors: {
      request: {
        use(fn) {
          requestHook = fn;
        },
      },
      response: {
        use(ok, fail) {
          failureHook = fail;
        },
      },
    },
    async request(method, url, data, config = {}) {
      const request = requestHook({
        method,
        url,
        data,
        headers: {},
        ...config,
      });
      requests.push(request);
      try {
        return await responder(request);
      } catch (error) {
        error.config = request;
        return failureHook(error);
      }
    },
    get(url, config) {
      return this.request("get", url, undefined, config);
    },
    post(url, data) {
      return this.request("post", url, data);
    },
  };
  const stub = (values) =>
    new SyntheticModule(
      Object.keys(values),
      function () {
        for (const [name, value] of Object.entries(values))
          this.setExport(name, value);
      },
      { context }
    );
  const dependencies = {
    "quasar/wrappers": stub({ boot: (fn) => fn }),
    quasar: stub({ Notify: { create() {} } }),
    vue: stub({ ref: (value) => ({ value }) }),
    axios: stub({
      default: {
        create(options) {
          assert.equal(options.baseURL, "/api/");
          assert.equal(options.withCredentials, true);
          return client;
        },
      },
    }),
  };
  const api = new SourceTextModule(
    await readFile(new URL("../src/boot/axios.js", import.meta.url), "utf8"),
    { context }
  );
  await api.link((name) => dependencies[name]);
  await api.evaluate();
  api.namespace.default({
    app: { config: { globalProperties: {} } },
    router: {
      replace(path) {
        redirects.push(path);
      },
    },
  });
  const session = new SourceTextModule(
    await readFile(new URL("../src/boot/session.js", import.meta.url), "utf8"),
    { context }
  );
  await session.link((name) => (name === "./axios" ? api : dependencies[name]));
  await session.evaluate();
  return {
    api: api.namespace,
    session: session.namespace,
    requests,
    redirects,
    respond(fn) {
      responder = fn;
    },
  };
}

test("login, refresh, password change and logout use the current CSRF token", async () => {
  const h = await setup();
  h.respond(async (r) => {
    if (r.url === "auth/login")
      return {
        data: {
          username: "admin",
          csrf_token: "first",
          must_change_password: true,
        },
      };
    if (r.url === "auth/me")
      return {
        data: {
          username: "admin",
          csrf_token: "rotated",
          must_change_password: true,
        },
      };
    return { data: {} };
  });
  await h.session.login("admin", "temporary-password");
  assert.equal(h.session.user.value.must_change_password, true);
  await h.session.restoreSession();
  await h.session.changePassword("temporary-password", "replacement-password");
  assert.equal(h.requests.at(-1).headers["X-CSRF-Token"], "rotated");
  assert.equal(h.requests.at(-1).data.new_password, "replacement-password");
  assert.equal(h.session.user.value, null);
  await h.session.login("admin", "replacement-password");
  await h.session.logout();
  assert.equal(h.requests.at(-1).headers["X-CSRF-Token"], "first");
  assert.equal(h.session.user.value, null);
});

test("expired sessions clear state and failed writes return to login", async () => {
  const h = await setup();
  h.respond(async () => {
    throw { response: { status: 401 } };
  });
  assert.equal(await h.session.restoreSession(), null);
  await assert.rejects(
    h.api.api.post("shg-transactions-logs", { member_id: 1 })
  );
  assert.equal(h.redirects.at(-1), "/login");
  h.respond(async () => {
    throw { response: { status: 503 } };
  });
  await assert.rejects(h.session.restoreSession());
});

test("member loading follows pagination so totals include every member", async () => {
  const h = await setup();
  h.respond(async (r) => ({
    data: [{ id: r.params.page }],
    headers: { "x-pagination-page-count": "3" },
  }));
  const members = await h.api.getMembers();
  assert.equal(members.length, 3);
  assert.equal(members[2].id, 3);
});
