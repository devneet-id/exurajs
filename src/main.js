

class Exura {

  // rebase the settings: Exura.configure({ mode: 'production', onError: fn })
  static configure( options = {} ) {
    for (const [key, value] of Object.entries(options)) {
      ExuraEnvironment.configure.set(key, value);
    }
    return ExuraEnvironment.configure;
  }

  // the old name of configure(), kept so existing calls keep working
  static environment( options = {} ) {
    return Exura.configure(options);
  }

  static production() {
    return ExuraEnvironment.configure.get('mode') === 'production';
  }

  // development output: a banner once, then each note; production says nothing
  static notice( type, text ) {
    if (Exura.production()) return;
    if (!ExuraEnvironment.banner) {
      ExuraEnvironment.banner = true;
      console.debug(`E X U R A - ${ExuraEnvironment.configure.get('version')} ////// development`);
    }
    if (text !== undefined) console[type](`EXURA · ${text}`);
  }

  // production: an error goes to onError (when set) and never reaches the console
  static report( error ) {
    const onError = ExuraEnvironment.configure.get('onError');
    if (typeof onError === 'function') {
      try { onError(error); } catch (e) {}
    }
  }

  // run a callback of a module; in production its error is caught and reported
  static guard( fn, ...args ) {
    if (!Exura.production()) return fn(...args);
    try {
      return fn(...args);
    } catch (error) {
      Exura.report(error);
    }
  }

  static module( fn ) {
    const ID = fn.name;

    // tracking: a clashing name replaces what was there
    if (ExuraEnvironment.module.has(ID)) {
      Exura.notice('warn', `module ${ID}() already exists — the new one replaces it`);
    } else if (ID in window) {
      Exura.notice('warn', `window.${ID} already exists — module ${ID}() replaces it`);
    }

    // store
    fn.store = Exura.store(ID, {});
    // state
    fn.state = Exura.state(ID, {});
    
    // render
    if (document.querySelectorAll(`exura-${ID}`).length > 0) {
      const element = document.querySelector(`exura-${ID}`);
      ExuraEnvironment.render.set(ID, element);
      if (!ExuraEnvironment.boiler.has(ID)) {
        ExuraEnvironment.boiler.set(ID, element.innerHTML);
      }
      // fn.element = element;
      fn.dom = Exura.dom(`exura-${ID}`);
      fn.render = ( reBoiler ) => {
        Exura.render(ID, reBoiler);
      };
    }else {
      fn.dom = false;
      fn.render = () => {
        Exura.notice('warn', `${ID}(): <exura-${ID}> not found, render() does nothing`);
      };
    }
    
    // effect
    fn.effect = (fn, dependencies) => {
      Exura.effect(ID, fn, dependencies);
    };

    // watch
    fn.watch = (target, fn2) => {
      const found = fn.dom ? fn.dom.find(target) : null;
      if (!found) {
        Exura.notice('warn', `${ID}(): watch target ${target} not found`);
        return;
      }
      Exura.watch(found.target, fn2);
    };

    // router
    fn.router = (url, fn, element) => {
      Exura.router(url, fn, element);
    };

    // moduleing
    ExuraEnvironment.module.set(ID, fn);
    window[ID] = ExuraEnvironment.module.get(ID);
    Exura.notice('log', `module ${ID}() ✓`);
  }

  static load( ID ) {
    if (ID) {
      return [
        ExuraEnvironment.module.get(ID),
        ExuraEnvironment.store.get(ID),
        ExuraEnvironment.state.get(ID),
        ExuraEnvironment.effect.get(ID),
        ExuraEnvironment.render.get(ID),
      ];
    }else {
      return ExuraEnvironment.module;
    }
  }

  static store(ID, data) {
    if (!ExuraEnvironment.store.has(ID)) {
      // create an empty store on first use
      ExuraEnvironment.store.set(ID, new ExuraStore());
    }

    if (data) {
      const current = ExuraEnvironment.store.get(ID);
      ExuraEnvironment.store.set(ID, new ExuraStore([
        ...current,
        ...Object.entries(data)
      ]));
    }

    return ExuraEnvironment.store.get(ID) || false;
  }


  static escape(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  // {{key}} is escaped, {{{key}}} is inserted as raw HTML
  static render(ID, reBoiler = null) {
    if (reBoiler !== null) {
      ExuraEnvironment.boiler.set(ID, reBoiler);
    }

    let boiler = ExuraEnvironment.boiler.get(ID);
    let render = ExuraEnvironment.render.get(ID);
    let store = ExuraEnvironment.store.get(ID);
    let state = ExuraEnvironment.state.get(ID);

    let data = new Map([
      ...store,
      ...state
    ]);

    for (let [key, value] of data) {
      boiler = boiler.replaceAll(`{{{${key}}}}`, value);
      boiler = boiler.replaceAll(`{{${key}}}`, Exura.escape(value));
    }

    render.innerHTML = boiler;
  }


  static state(ID, newState = {}) {
    let store = ExuraEnvironment.state.get(ID);

    if (!store) {
      store = new ExuraState(ID);
      ExuraEnvironment.state.set(ID, store);
    }

    for (const [key, val] of Object.entries(newState)) {
      store.set(key, val);
    }

    return store;
  }

  // a module may hold many effects; deps = null runs on every state change
  static effect(ID, effectFn, deps = null) {
    const state = ExuraEnvironment.state.get(ID) || new ExuraState(ID);
    ExuraEnvironment.state.set(ID, state);

    const effects = ExuraEnvironment.effect.get(ID) || [];
    const record = {
      deps,
      lastValues: deps ? deps.map(dep => state.get(dep)) : [],
      effect: effectFn,
      running: false,
    };
    effects.push(record);
    ExuraEnvironment.effect.set(ID, effects);

    Exura.trigger(record);
  }

  static trigger(record) {
    if (record.running || typeof record.effect !== 'function') return;
    record.running = true;
    try {
      Exura.guard(record.effect);
    } finally {
      record.running = false;
    }
  }


  static router(endpoint, fn) {
    const path = location.pathname;

    const keys = [];
    const pattern = endpoint.replace(/:([^/]+)/g, (_, key) => {
      keys.push(key);
      return "([^/]+)";
    });
    const regex = new RegExp("^" + pattern + "$");

    const match = path.match(regex);

    if (match && typeof fn === 'function') {
      const params = {};
      keys.forEach((k, i) => {
        params[k] = match[i + 1];
      });

      Exura.guard(fn, params);
    }
  }



  static watch(element, fn, options = {}) {
    const { once = true } = options;

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          Exura.guard(fn, entry);
          if (once) {
            observer.unobserve(entry.target); // stop after the first hit when once is true
          }
        }
      });
    });

    observer.observe(element);
  }

  static dom(selector) {
    if (document.querySelector(`exura-${selector}`)) {
      selector = `exura-${selector}`;
    }
    return new ExuraDom(selector);
  }




}


// production: an uncaught error or rejected promise never reaches the console
window.addEventListener('error', (event) => {
  if (!Exura.production()) return;
  event.preventDefault();
  Exura.report(event.error || event.message);
});
window.addEventListener('unhandledrejection', (event) => {
  if (!Exura.production()) return;
  event.preventDefault();
  Exura.report(event.reason);
});

// development: the banner shows once the page is parsed, even when nothing else was noted
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Exura.notice('debug'));
} else {
  setTimeout(() => Exura.notice('debug'));
}
