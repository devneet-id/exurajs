/* RUNE 1.0.17 | Created By @anwarachilles */
/* 
 * E X U R A
 * 
 * created by | Anwar Achilles
 * 
 * */
class ExuraEnvironment {

  static configure = new Map([
    ['version', '1.1'],
    ['mode', 'production'],
    ['url', `${window.location.protocol}//${window.location.host}/`],
  ]);

  static module = new Map();

  static store = new Map();

  static render = new Map();
  
  static boiler = new Map();

  static state = new Map();

  static effect = new Map();

}
class ExuraDom {
 
  constructor(selector = 'body') {
    this.selector = selector;
    this.target = typeof selector === 'string' ? document.querySelector(selector) : selector;
    return new Proxy(this, {
      get(target, prop) {
        if (prop in target) return target[prop];
        if (typeof target.target[prop] === 'function') {
          return (...args) => {
            const result = target.target[prop](...args);
            return result === undefined ? target : result;
          };
        }
        return target.target[prop];
      },
      set(target, prop, value) {
        target.target[prop] = value;
        return true;
      }
    });
  }

  text(content) {
    if (content === undefined) return this.target.textContent;
    this.target.textContent = content;
    return this;
  }

  html(content) {
    if (content === undefined) return this.target.innerHTML;
    this.target.innerHTML = content;
    return this;
  }

  attr(attr, value) {
    if (value === undefined) return this.target.getAttribute(attr);
    this.target.setAttribute(attr, value);
    return this;
  }

  append(content) {
    this.target.append(content instanceof ExuraDom ? content.target : content);
    return this;
  }

  find(selector) {
    const found = this.target.querySelector(selector);
    return found ? new ExuraDom(found) : null;
  }

  on(event, callback) {
    this.target.addEventListener(event, callback);
    return this;
  }

  clear() {
    this.target.innerHTML = '';
  }
}
class ExuraStore extends Map {
  constructor(entries) {
    super(entries);
  }

  set(key, value) {
    // console.log(`Set data: ${key} = ${value} 💾`);
    return super.set(key, value);
  }
}
class ExuraState extends Map {
  constructor(ID) {
    super();
    this.ID = ID;
  }

  set(key, value) {
    const old = this.get(key);
    const changed = old !== value;

    super.set(key, value);

    if (changed) {
      const eff = ExuraEnvironment.effect.get(this.ID);
      if (eff) {
        const { deps, lastValues, effect } = eff;

        if (deps.includes(key)) {
          const currVals = deps.map(dep => this.get(dep));
          const depChanged = !lastValues || !currVals.every((v, i) => v === lastValues[i]);

          if (depChanged && typeof effect === "function") {
            eff.lastValues = currVals;
            effect(); // 💥 Trigger effect
          }
        }
      }
    }

    return this;
  }
}
class Exura {

  static environment( env ) {}

  static module( fn ) {
    const ID = fn.name;

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
      fn.render = ( reBioler ) => {
        Exura.render(ID, reBioler);
      };
    }else {
      fn.dom = false;
      fn.render = () => {
        console.warn(`Component ${ID} Element Not Found`);
      };
    }
    
    // effect
    fn.effect = (fn, dependencies) => {
      Exura.effect(ID, fn, dependencies);
    };

    // watch
    fn.watch = (target, fn2) => {
      Exura.watch(fn.dom.find(target).target, fn2);
    };

    // router
    fn.router = (url, fn, element) => {
      Exura.router(url, fn, element);
    };

    // moduleing
    ExuraEnvironment.module.set(ID, fn);
    window[ID] = ExuraEnvironment.module.get(ID);
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
      // Kasih default kosong kalo belum ada
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


  static render(ID, reBioler = null) {
    if (reBioler !== null) {
      ExuraEnvironment.boiler.set(ID, reBioler);
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
      boiler = boiler.replaceAll(`{{${key}}}`, value);
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

  static effect(ID, effectFn, deps = null) {
    const state = ExuraEnvironment.state.get(ID) || new ExuraState(ID);
    ExuraEnvironment.state.set(ID, state);

    const effectData = ExuraEnvironment.effect.get(ID) || {
      deps: null,
      lastValues: [],
      effect: () => {},
    };

    const shouldRun = (() => {
      if (deps === null) return true;
      if (deps.length === 0 && !effectData.lastValues.length) return true;

      const currValues = deps.map(dep => state.get(dep));
      const changed = currValues.some((val, i) => val !== effectData.lastValues[i]);
      effectData.lastValues = currValues;
      return changed;
    })();

    effectData.deps = deps;
    effectData.effect = effectFn;
    ExuraEnvironment.effect.set(ID, effectData);

    if (shouldRun) effectFn();
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

      fn(params);
    }
  }



  static watch(element, fn, options = {}) {
    const { once = true } = options;

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          fn(entry);
          if (once) {
            observer.unobserve(entry.target); // 🔥 auto stop kalo once true
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