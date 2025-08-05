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