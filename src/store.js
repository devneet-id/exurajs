class ExuraStore extends Map {
  constructor(entries) {
    super(entries);
  }

  set(key, value) {
    // console.log(`Set data: ${key} = ${value} 💾`);
    return super.set(key, value);
  }
}