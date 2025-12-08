export default class { // Тестовый эксперимент
  static id = 'pseBLMv2l8UtBtbwEc7n';
  static name = 'Скрипты';
  static Host;
  static methods = {
    'Выполнить': async ($objectDocument) => {
      const naspunkt = [
        {
          "id": "e1bb2776174a7d6ad2a7fc256b2d890b",
          "value": "г Рязань",
          "unrestricted_value": "390000, Рязанская обл, г Рязань",
          "settlement": null,
          "city": {
            "fias_id": "86e5bae4-ef58-4031-b34f-5e9ff914cd55",
            "with_type": "г Рязань"
          },
          "okato": "61401000000"
        },
        {
          "id": "5f665e3ad556b77d96b32c268944ff5b",
          "value": "г Касимов",
          "unrestricted_value": "391300, Рязанская обл, г Касимов",
          "settlement": null,
          "city": {
            "fias_id": "5ad034ad-85b5-4106-be01-3d6e8b08cb2c",
            "with_type": "г Касимов"
          },
          "okato": "61405000000"
        },
        {
          "id": "111eb1da6dc00738c7972ec8b0d47c8c",
          "value": "г Скопин",
          "unrestricted_value": "391800, Рязанская обл, г Скопин",
          "settlement": null,
          "city": {
            "fias_id": "1ab7c980-83c4-46c6-b6bf-fc0d6b64b56a",
            "with_type": "г Скопин"
          },
          "okato": "61415000000"
        },
        {
          "id": "6c4f3f7da4b1f34883c8ae7760d7c7a6",
          "value": "г Сасово",
          "unrestricted_value": "391430, Рязанская обл, г Сасово",
          "settlement": null,
          "city": {
            "fias_id": "23c99789-de53-408e-b38d-09c5539cce2f",
            "with_type": "г Сасово"
          },
          "okato": "61410000000"
        },
        {
          "id": "006496940e0039e3411eee7606039265",
          "value": "г Ряжск",
          "unrestricted_value": "391960, Рязанская обл, Ряжский р-н, г Ряжск",
          "settlement": null,
          "city": {
            "fias_id": "5fdbcd60-a39f-4e15-94ea-ea2c7faba0ce",
            "with_type": "г Ряжск"
          },
          "okato": "61230501000"
        },
        {
          "id": "02963429fe648af0b1f9b2c7c652385a",
          "value": "г Рыбное",
          "unrestricted_value": "391110, Рязанская обл, Рыбновский р-н, г Рыбное",
          "settlement": null,
          "city": {
            "fias_id": "91d71d8c-2f1a-43c8-bc84-d78dc4245a1b",
            "with_type": "г Рыбное"
          },
          "okato": "61227501000"
        },
        {
          "id": "ce41b5d00c08b46af6f5e1195512fe4c",
          "value": "г Новомичуринск",
          "unrestricted_value": "391160, Рязанская обл, Пронский р-н, г Новомичуринск",
          "settlement": null,
          "city": {
            "fias_id": "dc0c31cd-e03e-4fc3-a714-1c9f4b61cc7e",
            "with_type": "г Новомичуринск"
          },
          "okato": "61225514000"
        },
        {
          "id": "9b30abcb84481831cc37ccc29cadc5b5",
          "value": "Шиловский р-н, рп Шилово",
          "unrestricted_value": "391500, Рязанская обл, Шиловский р-н, рп Шилово",
          "settlement": {
            "fias_id": "86dc8260-bcf7-4090-aba1-c719293bc449",
            "with_type": "рп Шилово"
          },
          "city": null,
          "okato": "61258551000"
        },
        {
          "id": "c3ebf9f178c7e6d06389139bd755dd4f",
          "value": "Кораблинский р-н, г Кораблино",
          "unrestricted_value": "391200, Рязанская обл, Кораблинский р-н, г Кораблино",
          "settlement": null,
          "city": {
            "fias_id": "8ea51b23-4bd6-401a-8e5a-0b3ecaa30081",
            "with_type": "г Кораблино"
          },
          "okato": "61212501000"
        },
        {
          "id": "ebce9ab019f3b525faa3a2b1bf93706c",
          "value": "г Михайлов",
          "unrestricted_value": "391710, Рязанская обл, Михайловский р-н, г Михайлов",
          "settlement": null,
          "city": {
            "fias_id": "8afcc513-bb8b-45a9-ac0d-ce8cb43b4c60",
            "with_type": "г Михайлов"
          },
          "okato": "61217501000"
        }
      ];
      
      const regionClassItem = this.Host.getClassById('P2Aeyxd8eHYqtcXxCX8D');
      naspunkt.forEach((p, idx) => {
        regionClassItem.createObjectDocument({ ...p, order: idx, region: 'Рязанская область'})
      });
      console.log('Объекты отправлены на создание');
    }
  };
}