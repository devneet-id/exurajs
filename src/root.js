/* 
 * E X U R A - {{ VERSION }}
 * 
 * created by | Anwar Achilles
 * 
 * */
class ExuraEnvironment {

  // rebased by Exura.configure(); mode: 'development' (default) | 'production'
  static configure = new Map([
    ['version', '{{ VERSION }}'],
    ['mode', 'development'],
    ['url', `${window.location.protocol}//${window.location.host}/`],
    ['onError', null],
  ]);

  static banner = false;

  static module = new Map();

  static store = new Map();

  static render = new Map();
  
  static boiler = new Map();

  static state = new Map();

  static effect = new Map();

}