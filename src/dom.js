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
