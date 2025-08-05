# E X U R A . J S

**Exura.js** is a minimalist JavaScript micro-framework built to simplify modern frontend development.  
Inspired by reactive design patterns, Exura focuses on clarity, modularity, and control — without the bulk of large frameworks.

## ✨ Key Features

- ⚙️ **Modular Architecture**  
  Build isolated apps using `Exura.module()` to keep your logic clean and scoped.

- 🧠 **Reactive State System**  
  Define and react to changes using `state.set()` and `effect()` — no boilerplate needed.

- 🎯 **Auto Rendering**  
  Bind state to the DOM using `{{expression}}` syntax inside `render()` templates.

- 👁️ **Lazy DOM Observing**  
  Trigger actions only when an element enters the viewport with `watch(selector, callback)`.

- 🛣️ **Built-in Router**  
  Declare routes and render per path using `router(path, callback)`.

## 🔍 Example

```js
Exura.module(function app1() {
  const { state, render, effect, watch, router } = app1;

  state.set('count', 0);

  effect(() => {
    render(`
      <h2>Hello 👋 Count: {{count}}</h2>
      <button onclick="app1.state.set('count', app1.state.get('count') + 1)">
        Increment
      </button>
    `);
  }, ['count']);

  watch("#observe-me", () => {
    alert("Element is now visible!");
  });

  router("/", () => render());
});
```

Simple, reactive, and powerful — that’s the Exura.js way.
Perfect for developers who love clean code, full control, and zero bloat ✨