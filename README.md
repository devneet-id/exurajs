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

## CDN
```html
<script src="https://raw.githubusercontent.com/devneet-id/exurajs/main/dist/exura.js"></script>
```

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



## 🛠️ BUILD WITH RUNE

**Exura** uses the **Rune** build engine.  
Before getting started, we recommend reading the official documentation here:  
👉 <https://github.com/devneet-id/rune>

Although in most cases you can simply run the available `build` commands, understanding the **Rune structure** will help you better track and manage post-processing tasks more efficiently.

Requirements, Make sure you have:
- **Composer** installed
- **PHP version 8+**

Then run this command:

```bash
composer install
```

To view the main rune script:
```shell
php rune
```

To build the project:
```shell
php rune build
php rune build --min=true
```

Development mode (auto watch & build on changes):
```shell
php rune watch
```



## 🎯 G O A L
Exura will:
- Be fully integrated with **Rune** as its built-in build engine.

- Feature a custom **preprocessing system**, inspired by JSX — but built natively into Rune’s environment.

- Embrace **all aspects of modern JavaScript**, including API design, reactive patterns, modular structure, and future-facing concepts.

- Stay committed to **never slowing down or interfering** with the developer's workflow.

Exura.js is here to assist — not to intrude.