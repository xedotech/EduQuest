var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-uyWVs3/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// src/middleware/cors.js
var corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
  "Access-Control-Max-Age": "86400"
  // 24 hours
};

// src/index.js
var SimpleRouter = class {
  static {
    __name(this, "SimpleRouter");
  }
  constructor() {
    this.routes = [];
  }
  add(method, path, handler) {
    this.routes.push({ method, path, handler });
  }
  get(path, handler) {
    this.add("GET", path, handler);
  }
  post(path, handler) {
    this.add("POST", path, handler);
  }
  put(path, handler) {
    this.add("PUT", path, handler);
  }
  delete(path, handler) {
    this.add("DELETE", path, handler);
  }
  async handle(request) {
    const url = new URL(request.url);
    const method = request.method;
    const path = url.pathname;
    for (const route of this.routes) {
      if (route.method === method && this.matchPath(route.path, path)) {
        const params = this.extractParams(route.path, path);
        request.params = params;
        return await route.handler(request);
      }
    }
    return new Response(JSON.stringify({
      error: "Not Found",
      message: "The requested endpoint does not exist"
    }), {
      status: 404,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  }
  matchPath(routePath, requestPath) {
    const routeParts = routePath.split("/");
    const requestParts = requestPath.split("/");
    if (routeParts.length !== requestParts.length) {
      return false;
    }
    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(":")) {
        continue;
      }
      if (routeParts[i] !== requestParts[i]) {
        return false;
      }
    }
    return true;
  }
  extractParams(routePath, requestPath) {
    const routeParts = routePath.split("/");
    const requestParts = requestPath.split("/");
    const params = {};
    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(":")) {
        const paramName = routeParts[i].substring(1);
        params[paramName] = requestParts[i];
      }
    }
    return params;
  }
};
var router = new SimpleRouter();
router.get("/health", () => {
  return new Response(JSON.stringify({
    status: "healthy",
    message: "EduQuest API is running on Cloudflare Workers",
    version: "1.0.0",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  }), {
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders
    }
  });
});
router.post("/auth/verify", async (request) => {
  try {
    const body = await request.json();
    return new Response(JSON.stringify({
      success: true,
      message: "Token verification endpoint (demo mode)",
      received: body
    }), {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: "Invalid JSON"
    }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  }
});
router.get("/quests", async (request) => {
  return new Response(JSON.stringify({
    success: true,
    quests: [],
    message: "Quests endpoint (demo mode)"
  }), {
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders
    }
  });
});
router.post("/quests", async (request) => {
  try {
    const body = await request.json();
    return new Response(JSON.stringify({
      success: true,
      quest: {
        id: "demo-quest-" + Date.now(),
        ...body,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      message: "Quest created (demo mode)"
    }), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: "Invalid JSON"
    }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  }
});
router.post("/content/process", async (request) => {
  try {
    const body = await request.json();
    const { content, title, category = "General" } = body;
    if (!content || !title) {
      return new Response(JSON.stringify({
        error: "Missing required fields: content, title"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    }
    const quest = {
      id: "demo-quest-" + Date.now(),
      title,
      description: `A quest generated from your ${category.toLowerCase()} content.`,
      category,
      difficulty: "beginner",
      levels: [
        {
          id: "level_1",
          title: "Level 1: Introduction",
          content: content.substring(0, 200) + "...",
          quizzes: [
            {
              question: "What is the main topic of this content?",
              options: [title, "Other topic", "Random topic", "Unknown"],
              correct_answer: 0,
              explanation: "The main topic is clearly stated in the title."
            }
          ],
          challenges: [
            {
              type: "text",
              prompt: "Summarize the main points in your own words.",
              solution: "Key concepts from the content"
            }
          ],
          xp_reward: 20,
          coin_reward: 5
        }
      ],
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    return new Response(JSON.stringify({
      success: true,
      quest,
      message: "Quest generated successfully!"
    }), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: "Failed to process content"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  }
});
var src_default = {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }
    try {
      request.env = env;
      return await router.handle(request);
    } catch (error) {
      console.error("Worker error:", error);
      return new Response(JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred"
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    }
  }
};

// ../../../../../usr/lib/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../../../usr/lib/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-uyWVs3/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// ../../../../../usr/lib/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-uyWVs3/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
