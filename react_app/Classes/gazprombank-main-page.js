import React from 'react';

import { AVObjectDocument } from '../VM/4-AVObjectDocument.jsx';

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
  
  static labelClicks = {
    'Кредиты': async ({ fieldItem, $objectDocument, e }) => {
      e.persist();
      console.log('Стать клиентом e', e);
      const hrzRect = fieldItem.domElement.getBoundingClientRect();
      // const objRootDivRect = $objectDocument.$rootDivDomElement.getBoundingClientRect();
      $objectDocument.renderCustomDiv({
        content: (
          <div className="pos-abs bg-tree z-index-1000" style={{ top: hrzRect.bottom + 1, right: 0, left: 0, height: '500px' }} >
            <AVObjectDocument
              objectDocumentPath={'Domains/workspace/Domains/mTLA7zmXmQGvH5j3GexV/Domains/2PoyIkLXCEUWgkR7lggL/Classes/DSqVNzRZxNpg8aKdWRd4/ObjectDocuments/93b5Ld0pnnc350FEEy1r'}
              onLabelClickFunc={({ label, e }) => {
                if (label === 'Онлайн - заявка на кредит наличными') {
                  this.Host.navigate('/gazprombank-credit-1')
                }
              }}
              noOkCancelPanel
            ></AVObjectDocument>
          </div>
        )
      })
    },
    'Карты': async ({ fieldItem, $objectDocument, e }) => {
      e.persist();
      console.log('Стать клиентом e', e);
      const hrzRect = fieldItem.domElement.getBoundingClientRect();
      // const objRootDivRect = $objectDocument.$rootDivDomElement.getBoundingClientRect();
      $objectDocument.renderCustomDiv({
        content: (
          <div className="pos-abs bg-tree z-index-1000" style={{ top: hrzRect.bottom + 1, right: 0, left: 0, height: '500px' }} >
            <AVObjectDocument
              objectDocumentPath={'Domains/workspace/Domains/mTLA7zmXmQGvH5j3GexV/Domains/2PoyIkLXCEUWgkR7lggL/Classes/ZRlaz49Aw4OlMqVmG8gd/ObjectDocuments/mRizTVfxh4b1jx1cnnKl'}
              onLabelClickFunc={({ label, e }) => {
                // if (label === 'Онлайн - заявка на кредит наличными') {
                //   this.Host.navigate('/gazprombank-credit-1')
                // }
              }}
              noOkCancelPanel
            ></AVObjectDocument>
          </div>
        )
      })
    },
    'Вклады и счета': async ({ fieldItem, $objectDocument, e }) => {
      e.persist();
      console.log('Стать клиентом e', e);
      const hrzRect = fieldItem.domElement.getBoundingClientRect();
      // const objRootDivRect = $objectDocument.$rootDivDomElement.getBoundingClientRect();
      $objectDocument.renderCustomDiv({
        content: (
          <div className="pos-abs bg-tree z-index-1000" style={{ top: hrzRect.bottom + 1, right: 0, left: 0, height: '500px' }} >
            <AVObjectDocument
              objectDocumentPath={'Domains/workspace/Domains/mTLA7zmXmQGvH5j3GexV/Domains/2PoyIkLXCEUWgkR7lggL/Classes/RtKUjsHuCPo4Xvu0CFT5/ObjectDocuments/Z9cTQ8oeBcBnYV9YvKVZ'}
              onLabelClickFunc={({ label, e }) => {
                // if (label === 'Онлайн - заявка на кредит наличными') {
                //   this.Host.navigate('/gazprombank-credit-1')
                // }
              }}
              noOkCancelPanel
            ></AVObjectDocument>
          </div>
        )
      })
    },
    
    'Премиум': async ({ fieldItem, $objectDocument, e }) => {
      e.persist();
      console.log('Стать клиентом e', e);
      const hrzRect = fieldItem.domElement.getBoundingClientRect();
      // const objRootDivRect = $objectDocument.$rootDivDomElement.getBoundingClientRect();
      $objectDocument.renderCustomDiv({
        content: (
          <div className="pos-abs bg-tree z-index-1000" style={{ top: hrzRect.bottom + 1, right: 0, left: 0, height: '500px' }} >
            <AVObjectDocument
              objectDocumentPath={'Domains/workspace/Domains/mTLA7zmXmQGvH5j3GexV/Domains/2PoyIkLXCEUWgkR7lggL/Classes/CuHoisPqeNijprVKaTI1/ObjectDocuments/39Z4SAxDCRdOdUl2RP9v'}
              onLabelClickFunc={({ label, e }) => {
                // if (label === 'Онлайн - заявка на кредит наличными') {
                //   this.Host.navigate('/gazprombank-credit-1')
                // }
              }}
              noOkCancelPanel
            ></AVObjectDocument>
          </div>
        )
      })
    }
    
  };

}