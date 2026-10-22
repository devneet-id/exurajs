/* 
 * E X U R A - {{ VERSION }}
 * 
 * created by | Anwar Achilles
 * 
 * */
class ExuraEnvironment {

  static configure = new Map([
    ['version', '{{ VERSION }}'],
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