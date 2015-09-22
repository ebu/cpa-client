CPA Device Client
=================

This folder contains a stand-alone CPA device client.

## Prerequisites

Ensure your system has [Node.js](http://nodejs.org/) (v0.10 or later) and NPM installed.

Install [Bower](http://bower.io/):

    $ sudo npm install -g bower
    $ sudo npm install -g bower-installer

## Getting Started

    $ git clone https://github.com/ebu/cpa-client.git
    $ cd cpa-client/device
    $ npm install
    $ bower install

## Configure

The client reads configuration settings from the file `config.js`.
An example config for reference is in `config.dist.js`.

    $ cp config.dist.js config.js

Edit `config.js` to set the Service Provider domains.

## Start the server

The client is hosted in a static HTML page, run from a Node.js Express
application.

To start the server on the default port (8000):

    $ npm start

To use a different port, set the `PORT` environment variable:

    $ PORT=8080 npm start

Then, open your browser at `http://localhost:8080/cpa-device.html`

## Development

If you want to use this client to change either the [cpa.js](https://github.com/ebu/cpa.js)
or [radiotag.js](https://github.com/ebu/radiotag.js) libraries, you can use the
following instructions to link the client to local repositories.

In a separate directory, clone the cpa.js repository and create the link:

    $ git clone https://github.com/ebu/cpa.js
    $ cd cpa.js
    $ bower link

Similarly, for radiotag.js:

    $ git clone https://github.com/ebu/radiotag.js
    $ cd radiotag.js
    $ bower link

Then, go to `cpa-client/device` and type:

    $ bower link cpa.js
    $ bower link radiotag.js

Don't forget to use `grunt watch` in cpa.js and radiotag.js folders in order
to compile the files when changed.

## Contributors

* [Michael Barroco](https://github.com/barroco) (EBU)
* [Chris Needham](https://github.com/chrisn) (BBC)

## Copyright & License

Copyright (c) 2014-2015, EBU-UER Technology & Innovation

The code is under BSD (3-Clause) License. (see LICENSE.txt)
