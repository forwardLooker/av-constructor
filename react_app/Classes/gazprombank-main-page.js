export default class {
  static id = 'F3vEpGBbrw3qSiiTa9vH';
  static name = 'Газпромбанк (главная)';
  static Host; // инициализируется в момент соединения с классом

  static methods = {
    'Стать клиентом': async ({ $objectDocument, e }) => {
      console.log('Стать клиентом e', e);
    }
  };
}