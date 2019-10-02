tdp_matomo [![Phovea][phovea-image]][phovea-url] [![NPM version][npm-image]][npm-url] [![Dependency Status][daviddm-image]][daviddm-url]
=====================

Matomo tracking for TDP applications based on provenance graph commands.

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

Provenance commands using the extension point `actionFunction` must be annotated with the property `tdp_matomo` in order to be found and tracked.
The `tdp_matomo` configuration property requires the properties `category` and `action` from the `IMatomoEvent` (in *src/matomo.ts*), which can contain arbitrary strings.

```ts
  registry.push('actionFunction', 'targidCreateView', function() {
    return System.import('./internal/cmds');
  }, {
    factory: 'createViewImpl',
    tdp_matomo: {
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

<a href="https://caleydo.org"><img src="http://caleydo.org/assets/images/logos/caleydo.svg" align="left" width="200px" hspace="10" vspace="6"></a>
This repository is part of **[Phovea](http://phovea.caleydo.org/)**, a platform for developing web-based visualization applications. For tutorials, API docs, and more information about the build and deployment process, see the [documentation page](http://phovea.caleydo.org).


[phovea-image]: https://img.shields.io/badge/Phovea-Client%20Plugin-F47D20.svg
[phovea-url]: https://phovea.caleydo.org
[npm-image]: https://badge.fury.io/js/tdp_matomo.svg
[npm-url]: https://npmjs.org/package/tdp_matomo
[daviddm-image]: https://david-dm.org/datavisyn/tdp_matomo/status.svg
[daviddm-url]: https://david-dm.org/datavisyn/tdp_matomo
