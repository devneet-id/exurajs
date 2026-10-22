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
      const effects = ExuraEnvironment.effect.get(this.ID) || [];
      for (const record of effects) {
        if (record.deps === null) {
          Exura.trigger(record);
          continue;
        }
        if (!record.deps.includes(key)) continue;

        const currVals = record.deps.map(dep => this.get(dep));
        const depChanged = !currVals.every((v, i) => v === record.lastValues[i]);
        if (depChanged) {
          record.lastValues = currVals;
          Exura.trigger(record);
        }
      }
    }

    return this;
  }
}