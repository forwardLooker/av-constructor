import React from 'react';

export default class {
  static id = 'F3vEpGBbrw3qSiiTa9vH';
  static name = 'Газпромбанк (главная)';
  static Host; // инициализируется в момент соединения с классом

  static methods = {
    'Стать клиентом': async ({ $objectDocument, e }) => {
      e.persist();
      console.log('Стать клиентом e', e);
      const btnRect = e.target.getBoundingClientRect();
      const objRootDivRect = $objectDocument.$rootDivDomElement.getBoundingClientRect();
      $objectDocument.renderCustomDiv({
        content: (
          <div className="pos-abs bg-tree z-index-1000" style={{ top: btnRect.bottom, right: objRootDivRect.width - btnRect.right , width: '200px', height: '200px' }} >
            Стать клиентом
            <div>Дебетовая карта</div>
            <div>Накопительный счет</div>
            <div>Лучшая премиальная карта</div>
            <div>Кредит</div>
            <div>Инвестиции</div>
          </div>
        )
      })
    }
  };
}