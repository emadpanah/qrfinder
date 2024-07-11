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

Brief Description of the QR Campaign Platform
Introduction
The QR Campaign Platform is an innovative solution designed to enhance user engagement and reward participation through a series of gamified campaigns. Built on the Telegram ecosystem and leveraging the TON blockchain, the platform enables shops to create and manage campaigns that encourage users to complete various achievements in exchange for tokens and rewards. This white paper outlines the key features, functionalities, and benefits of the platform.

Overview
The platform offers a seamless integration with Telegram, utilizing it as both a launcher for mini-apps and an authenticator for users. The core functionality revolves around shops creating campaigns that consist of multiple achievements. Users participate in these campaigns by completing tasks such as following social media accounts, connecting web3 wallets, staking tokens, or scanning QR codes at specified locations. Successful completion of achievements results in token rewards, which can be redeemed for products or additional benefits.

Key Components
Shops and Campaigns:

Shops: Entities that create and manage campaigns. Each shop has a unique profile and can set up multiple campaigns.
Campaigns: Defined by shops, campaigns consist of various achievements and offer rewards for completion. Campaigns have a start and end date, rules, and specific rewards.
Achievements:

Types of Achievements: Include social media actions (following on Twitter/Instagram), web3 actions (connecting wallets, staking tokens), and physical actions (scanning QR codes).
Verification: Actions are verified using APIs for social media, blockchain interactions for web3 tasks, and geolocation data for QR code scans.
Rewards and Tokens:

Token Issuance: Users earn tokens for completing achievements. These tokens are based on the TON blockchain and are managed through smart contracts.
Rewards: Tokens can be redeemed for products or additional benefits offered by shops. Rewards are limited to top performers or early achievers in some cases.
Smart Contracts:

Token Management: Handle the issuance and distribution of tokens securely and transparently.
Achievement Validation: Automate the validation of completed achievements and the distribution of rewards.
User Flow
Shop Setup:

Shop admins register their shops on the platform through Telegram.
Shops create campaigns and define the achievements and rewards.
User Participation:

Users authenticate and interact with the platform via Telegram.
Users join campaigns and complete various achievements by performing specified tasks.
Verification and Rewards:

The platform verifies the completion of achievements through API calls and blockchain interactions.
Users receive tokens and can redeem them for rewards or products.
Tracking and Notifications:

Users track their progress and receive notifications about new campaigns, achievements, and rewards through the Telegram bot.
Benefits
Engagement: Encourages user participation and engagement through gamified campaigns.
Rewards: Provides tangible rewards and token incentives for completing achievements.
Transparency: Utilizes blockchain technology to ensure secure and transparent transactions.
Ease of Use: Seamless integration with Telegram makes it easy for users to participate without additional registration steps.
Conclusion
The QR Campaign Platform is designed to create a dynamic and engaging experience for users while providing shops with a powerful tool to promote their products and services. By leveraging the TON blockchain and integrating with Telegram, the platform offers a secure, transparent, and user-friendly solution for managing and participating in campaigns.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
