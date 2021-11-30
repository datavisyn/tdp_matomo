DEPRECATED: tdp_matomo  
=====================
[![Target Discovery Platform][tdp-image-client]][tdp-url] [![Target Discovery Platform][tdp-image-server]][tdp-url] [![NPM version][npm-image]][npm-url] [![Build Status][circleci-image]][circleci-url]

Matomo tracking for TDP applications based on provenance graph commands.

### DEPRECATION Information
Please note that this project has been archived and is no longer being maintained. There is an active development under https://github.com/datavisyn/tdp_core and we will also contribute our future changes to it.


Configuration
------------

* The tracking starts when a URL to a Matomo backend is set in the `config.js`.
* The site ID corresponds with the Matomo site.
* Enable the [md5](https://en.wikipedia.org/wiki/MD5) encryption of user names to prevent plaintext logging (e.g., when using Matomo with LDAP login)

```js
{
  "matomo": {
    "url": "https://matomo.my-example-domain.com/", // matomo url with a trailing slash
    "site": "1",
    "encryptUserName": false
  }
}
```

### Provenance Commands

Provenance commands using the extension point `actionFunction` must be annotated with the property `analytics` in order to be found and tracked.
The `analytics` configuration property requires the properties `category` and `action` from the `IMatomoEvent` (in *src/matomo.ts*), which can contain arbitrary strings.

```ts
  registry.push('actionFunction', 'targidCreateView', function() {
    return import('./internal/cmds');
  }, {
    factory: 'createViewImpl',
    analytics: {
      category: 'view',
      action: 'create'
    }
  });
```


Installation
------------

```
git clone https://github.com/datavisyn/tdp_matomo.git
cd tdp_matomo
npm install
```

Testing
-------

```
npm test
```

Building
--------

```
npm run build
```



***

<a href="https://www.datavisyn.io"><img src="https://www.datavisyn.io/img/logos/datavisyn-logo.png" align="left" width="200px" hspace="10" vspace="6"></a>
This repository is part of the **Target Discovery Platform** (TDP). For tutorials, API docs, and more information about the build and deployment process, see the [documentation page](https://wiki.datavisyn.io).




[tdp-image-client]: https://img.shields.io/badge/Target%20Discovery%20Platform-Client%20Plugin-F47D20.svg
[tdp-image-server]: https://img.shields.io/badge/Target%20Discovery%20Platform-Server%20Plugin-10ACDF.svg
[tdp-url]: http://datavisyn.io
[npm-image]: https://badge.fury.io/js/tdp_matomo.svg
[npm-url]: https://npmjs.org/package/tdp_matomo
[circleci-image]: https://circleci.com/gh/datavisyn/tdp_matomo.svg?style=shield
[circleci-url]: https://circleci.com/gh/datavisyn/tdp_matomo

