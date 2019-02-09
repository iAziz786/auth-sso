# [WIP] auth-sso 

[![Build Status](https://travis-ci.org/iAziz786/auth-sso.svg?branch=master)](https://travis-ci.org/iAziz786/auth-sso) [![Coverage Status](https://coveralls.io/repos/github/iAziz786/auth-sso/badge.svg?branch=master)](https://coveralls.io/github/iAziz786/auth-sso?branch=master)

auth-sso is an OpenID Connect authorization server. Currently only support authorization code flow.

This is work in progress. And support for implicit and hybrid flow will be added soon.

### Incompletion in current flow

Apart from missing implicit and hybrid flow, currently this implementation does not support these (optional) request parameters:
  * `display`
  * `prompt`
  * `max_age`
  * `ui_locales`
  * `id_token_hint`
  * `acr_values`

## License
auth-sso is released under the [MIT License][2]

[1]: https://en.wikipedia.org/wiki/Single_sign-on
[2]: https://opensource.org/licenses/MIT
