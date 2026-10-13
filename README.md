<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ yarn install
```

## Autenticación y cuentas

Todas las rutas requieren un JWT (`Authorization: Bearer <token>`), salvo `GET /`,
`POST /auth/register` y `POST /auth/login`. Cada cuenta ve únicamente sus propios mazos y cards:
intentar acceder a un mazo ajeno responde `404`.

| Método | Ruta | Descripción |
| ------ | ---- | ----------- |
| `POST` | `/auth/register` | Crea una cuenta (`email`, `password` ≥ 8 caracteres, `name` opcional) y devuelve `{ accessToken, user }` |
| `POST` | `/auth/login` | Inicia sesión y devuelve `{ accessToken, user }` |
| `GET` | `/auth/me` | Datos de la cuenta autenticada |

```bash
curl -X POST http://localhost:3000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"yo@example.com","password":"password123","name":"Yo"}'

curl http://localhost:3000/decks -H "Authorization: Bearer $TOKEN"
```

Notas:

- Las contraseñas se guardan con `scrypt` (salt aleatorio por usuario); nunca se devuelve el hash.
- `JWT_SECRET` es obligatorio cuando `NODE_ENV=production`; en desarrollo se usa un secreto por defecto.
- Los mazos creados antes de existir las cuentas (sin `ownerId`) son adoptados automáticamente
  por la primera cuenta que se registre.

## Docker

```bash
# construir y levantar (http://localhost:3000)
$ cp .env.example .env   # define al menos JWT_SECRET
$ docker compose up --build -d

# logs y parada
$ docker compose logs -f
$ docker compose down
```

Variables de entorno soportadas: `PORT` (puerto publicado en el host, 3000 por defecto),
`CORS_ORIGIN` (lista separada por comas), `DB_FILE` (ruta del JSON, `/app/data/db.json`),
`JWT_SECRET` (obligatorio) y `JWT_EXPIRES_IN` (`7d` por defecto).
Los datos persisten en el volumen `cogni-data` montado en `/app/data`.

Sin compose:

```bash
$ docker build -t back-cogni .
$ docker run -d -p 3000:3000 -e JWT_SECRET=un-secreto-largo \
    -v cogni-data:/app/data --name back-cogni back-cogni
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
