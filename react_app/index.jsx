import React from 'react';
import ReactDom from 'react-dom';
import { createRoot } from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import './index.css';
import { AVHost } from './VM/1-AVHost.jsx';
import { Host } from './M/1-Host.js';

import vkBridge from '@vkontakte/vk-bridge';

import '@vkontakte/vkui/dist/vkui.css';

let config;
let host;
let vkClass;

export class App extends React.PureComponent {
  state = {
    router: null
  }
  render() {
    if (!this.state.router) {
      return (<AVHost appRef={this} hostItem={host} vkClass={vkClass} config={config} itemFullScreenMode={window.vk_app ? true : false}></AVHost>)
    } else {
      return (
        <RouterProvider router={this.state.router} />
      )
    }
  }
}

async function vkStart () {
  host = new Host();
  vkClass = host.getClassByPath('Domains/workspace/Domains/T4mhHKJGircmevLZbBHm/Classes/z3A9B1SghE3xHKzStVth');
  // vkClass = host.getClassByPath('Domains/workspace/Domains/fKEKGydMtMgcGv5Iwn4s/Classes/4qEmXDmHobTXfNnziIbE');
  
  const [c] = await Promise.all([host.getConfig.bind(host)(), vkClass.getFieldDescriptors.bind(vkClass)(), vkClass.getObjectDocuments.bind(vkClass)()]);
  config = c;
  
  // Загрузка данных vkUser в базу данных
  const vkUser = await vkBridge.send('VKWebAppGetUserInfo');
  const vkUserClass = host.getClassByName('Пользователь');
  const vkUserObjDocs = await vkUserClass.getObjectDocuments();
  console.log('Загрузка класса данных Пользователь vkUserObjDocs:', vkUserObjDocs);
  if (vkUserObjDocs.length === 0 && vkUser) {
    console.log('Создание объекта Пользователь в базе vkUser:', vkUser);
    vkUserClass.createObjectDocument({ ...vkUser, name: vkUser.first_name + ' ' + vkUser.last_name, vkId: vkUser.id })
  }
  
  // Загрузка Друзей в базу данных          
  const systemLogClass = host.getClassByName('Системный log');
  const systemLogObjDocs = await systemLogClass.getObjectDocuments();
  let _friendsLoaded;
  if (systemLogObjDocs.some(o => o.name === 'Друзья загружены')) {
    _friendsLoaded = true;
    console.log('Друзья загружены Лог успешно найден');
  }
  if (!_friendsLoaded) {
    const vkFriendsClass = host.getClassByName('Друзья');
    const vkFriendsObjDocs = await vkFriendsClass.getObjectDocuments();
    await vkBridge.send('VKWebAppGetAuthToken', {
      app_id: 54509391,
      scope: 'friends,status'
    })
      .then(async (data) => {
        if (data.access_token) {
          // Ключ доступа пользователя получен
          const friendsList = await vkBridge.send('VKWebAppCallAPIMethod', {
            method: 'friends.get',
            params: {
              v: '5.131',
              access_token: data.access_token,
              fields: 'bdate,can_post,can_see_all_posts,can_write_private_message,city,contacts,country,domain,education,has_mobile,timezone,last_seen,nickname,online,photo_100,photo_200_orig,photo_50,photo_id,relation,sex,status,universities'
            }
          });
          console.log('vk friends.get', friendsList);
          friendsList.response.items.map(vkFrObj => ({
            bdate: vkFrObj.bdate || '',
            can_post: vkFrObj.can_post || '',
            can_see_all_posts: vkFrObj.can_see_all_posts || '',
            can_write_private_message: vkFrObj.can_write_private_message || '',
            city: vkFrObj.city || '',
            contacts: vkFrObj.contacts || '',
            country: vkFrObj.country || '',
            domain: vkFrObj.domain || '',
            education: vkFrObj.education || '',
            has_mobile: vkFrObj.has_mobile || '',
            timezone: vkFrObj.timezone || '',
            last_seen: vkFrObj.last_seen || '',
            nickname: vkFrObj.nickname || '',
            online: vkFrObj.online || '',
            photo_100: vkFrObj.photo_100 || '',
            photo_200_orig: vkFrObj.photo_200_orig || '',
            photo_50: vkFrObj.photo_50 || '',
            photo_id: vkFrObj.photo_id || '',
            relation: vkFrObj.relation || '',
            sex: vkFrObj.sex || '',
            status: vkFrObj.status || '',
            universities: vkFrObj.universities || '',

            'Название': `День рождения: ${vkFrObj.first_name} ${vkFrObj.last_name}`,
            first_name: vkFrObj.first_name || '',
            last_name: vkFrObj.last_name || '',
            vkId: vkFrObj.id,
          })).forEach(async frObj => {
            let findedFriend = vkFriendsObjDocs.find(obj => obj.vkId === frObj.vkId);
            if (!findedFriend) {
              await vkFriendsClass.createObjectDocument(frObj)
            } else {
              if (findedFriend.bdate !== frObj.bdate) {
                console.log('Обнаружен объект в классе Друзья для обновления bdate', findedFriend, frObj);
                const objDocItem = host.getObjectDocumentByReference(findedFriend.reference);
                await objDocItem.saveData({ bdate: frObj.bdate });
              }
            }
          });
          systemLogClass.createObjectDocument({ name: 'Друзья загружены' });
        }
      })
      .catch((error) => {
        // Ошибка
        console.log(error);
      });
  }
  
  createRoot(document.getElementById('app')).render(<App />);
}

if (window.vk_app) {
  vkBridge.send('VKWebAppInit');
  console.log('vkBridge VKWebAppInit');
  vkStart()
} else {
  createRoot(document.getElementById('app')).render(<App />);
}


// createRoot(document.getElementById('app')).render(<App />);
// ReactDom.render(
//   <App/>,
//   document.getElementById('app')
// )
