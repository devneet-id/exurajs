# E X U R A . J S

**Exura.js** is a reactive JavaScript micro-framework: modules, state, effects and rendering — without the bulk of large frameworks.
Part of the **Exura series** — the power of a modern reactive framework in a single, super-light script.

## ✨ Key Features

- ⚙️ **Modules** — `Exura.module(function name() {…})` registers a module; the `<exura-name>` tag is its view and `name()` runs it.
- 🧠 **Reactive state** — `state.set()` triggers every `effect(fn, deps)` whose dependencies changed; an effect without deps runs on every change.
- 🗃️ **Store** — static data for a module; merged with state when rendering.
- 🎯 **Templates** — the content of `<exura-name>` is the template; `{{key}}` is HTML-escaped, `{{{key}}}` inserts raw HTML; both work in text and in attributes.
- 👁️ **Lazy watch** — `watch(selector, fn)` runs once an element enters the viewport.
- 🛣️ **Router** — `router('/user/:id', fn)` matches the current path and passes params.

## 📦 Install

```html
<script src="https://cdn.jsdelivr.net/gh/devneet-id/exurajs@1.x/dist/exura.min.js"></script>
```

## 🔍 Example

```html
<exura-counter>
  <h2>Hello 👋 Count: {{count}}</h2>
  <button onclick="counter.state.set('count', counter.state.get('count') + 1)">Increment</button>
</exura-counter>

<script>
  Exura.module(function counter() {
    const { state, effect, render } = counter;

    state.set('count', 0);
    effect(() => render(), ['count']);
  });

  counter(); // a module is registered first, then run when you call it
</script>
```

More: `store.set(key, value)`, `watch('#el', fn)`, `router('/post/:id', ({ id }) => …)`, `Exura.dom(selector)`.

## 🧩 The Exura Series

Exura mirrors a modern CSS / JS / PHP framework — at a fraction of the weight, without losing the abilities of a framework.

| Package | Focus | Repository |
|---|---|---|
| **exuracss** | modern semantic styling | [devneet-id/exuracss](https://github.com/devneet-id/exuracss) |
| **exurajs** | modern reactive JavaScript | [devneet-id/exurajs](https://github.com/devneet-id/exurajs) |
| **exuraphp** | modern HTTP API endpoints | [devneet-id/exuraphp](https://github.com/devneet-id/exuraphp) |

## 🛠️ Shaped with Rune

This project is shaped with **Rune** — a lore-driven, modular concept beneath PHP that responds to development rather than dictating it.  
Its runite, `cast`, holds the casts that turn `src/` into `dist/`.  
👉 <https://github.com/devneet-id/rune>

You can simply run the casts below; knowing how a runite works helps when you want to shape your own.

Requirements:
- **Composer** installed
- **PHP version 8.1+**

Then run this command:

```bash
composer install
```

The runite of this project is `cast`. To view its main screen (all casts with notes):
```shell
php cast
```

To build the project:
```shell
php cast build
php cast build --min=true
```

Version (stored in the runite itself as `const VERSION`, applied on build):
```shell
php cast version
php cast version --up            # 1.0.0 -> 1.0.1  (--up=minor | major | release)
php cast version --pre           # 1.0.1 -> 1.0.1-dev  (--pre=beta.1)
php cast version --set=1.0.0
```

## 🎯 Goal

Exura.js will:

- Grow its **reactivity** — list rendering and expressions in templates.
- Offer a **template preprocessor** inspired by JSX, shaped through a Rune cast.
- Stay **one small file** that works with a single `<script>` tag — no build step for the user.
- Never slow down or interfere with the developer's workflow.

Exura.js is here to assist — not to intrude.
