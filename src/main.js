

class Exura {

  // static environment( environment = {} ) {
  //   // rebase
  //   if (environment.configure) {
  //     Exura._configure = new Map([...Exura._configure, ...Object.entries(environment.configure)]);
  //   }
  //   if (environment._store) {
  //     Exura._store = new Map([...Exura._store, ...Object.entries(environment.store)]);
  //   }
  //   // Load Service
  //   Object.entries(Exura._service).forEach(([name, fn]) => {
  //     if (typeof window[name] === 'function') {
  //       console.log(`EXURA - Service:: ${name}() Already Exists`);
  //     } else {
  //       window[name] = fn;
  //     }
  //   });
  //   // globalize
  //   window['Exura'] = this;
  //   // copyright
  //   console.clear();
  //   console.debug(`E X U R A  - ${Exura._configure.get('version')} //////`);
  // }

  static environment( env) {

  }

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
      ExuraEnvironment.boiler.set(ID, element.innerHTML);
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
    return [
      ExuraEnvironment.module.get(ID),
      ExuraEnvironment.store.get(ID),
      ExuraEnvironment.state.get(ID),
      ExuraEnvironment.effect.get(ID),
      ExuraEnvironment.watch.get(ID),
      ExuraEnvironment.render.get(ID),
    ];
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


  static router(endpoint, fn, element = 'route') {
    const el = document.querySelector(`exura-${element}`);
    if (!el) return;

    if (location.pathname === endpoint && typeof fn === 'function') {
      fn(el);
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
    return new ExuraDom(selector);
  }




}