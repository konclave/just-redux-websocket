

### 2.0.1 (2023-05-11)

## [2.0.0](https://github.com/konclave/just-redux-websocket/compare/v1.6.0...v2.0.0) (2023-05-11)


### ⚠ BREAKING CHANGES

* now library exposes an es modules

### Features

* compile to es-modules ([7e4c007](https://github.com/konclave/just-redux-websocket/commit/7e4c007e2423153be4f88a39c278eb2b01862632))

# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [1.6.0] - 2023-04-30

### Changed

- Updated dependencies

### Fixed

- Added reconnect loop fix
- Added error serialization before dispatch ERROR action

## [1.5.1] - 2021-05-10

### Added

- Added maintenance note to README.
- Bump minor dependency versions.

## [1.5.0] - 2021-02-16

### Added

- Added `reconnectOnError` option as part of `Options` interface to enable reconnection attempt when connection is closed via an error event.

## [1.4.0] - 2020-11-17

### Added

- Added deserializer option as part of `Options` interface to enable deserializing of messages sent by the server. By default the message data gets passed through as is.

## [1.3.0] - 2020-09-29

### Added

- Added dateSerializer option as part of `Options` interface to enable serializing `meta.timestamp`. The default behavior retains `meta.timestamp` as a `Date` object.

### Changed

- Bump elliptic from 6.4.1 to 6.5.3
- Bump prismjs from 1.15.0 to 1.21.0 in /demo
- Bump http-proxy from 1.17.0 to 1.18.1 in /demo
- Bump lodash from 4.17.15 to 4.17.20 in /demo
- Bump elliptic from 6.5.2 to 6.5.3 in /demo