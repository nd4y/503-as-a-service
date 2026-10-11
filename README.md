# 503-as-a-service

Меньше инфраструктуры. Тот же ответ.

Публичная страница: https://nd4y.github.io/503-as-a-service/

Промо для провайдеров S3, которым нужен предсказуемый HTTP 503. Страница включает API Playground, калькулятор, статус, тарифы и плавные анимации с поддержкой уменьшенного движения.

## Сборка

Node.js 22+, внешние npm-зависимости отсутствуют.

```sh
npm run build
npm test
```

Исходники находятся в web/. Самодостаточная страница собирается в docs/index.html; GitHub Pages публикует каталог docs/ из ветки feature/github-pages.

## API

GitHub Pages обслуживает статическую страницу. Playground обращается к публичному API https://five-oh-three-as-a-service.nd4y.icu/api/s3/* . GET, PUT, POST, HEAD и DELETE возвращают настоящий HTTP 503, XML ServiceUnavailable и Retry-After: 503. HEAD не содержит тела ответа. Сервис не сохраняет объекты.

CORS разрешён для origin https://nd4y.github.io, без передачи credentials. Cookie preferences и выбор анимаций сохраняются только в браузере посетителя.

Изменения исходников вносятся через отдельную ветку и pull request.
