CPA Device Client
=================

This folder contains a stand-alone cpa device client. 

## Install

1. Edit config.js (example in config.dist.js)

2. Run it through a http server. The client is a static html page.

```bash

npm install -g http-server

http-server .

```

3. Go to `http://localhost:8080/cpa-device.html`


## Development 

### Build
```bash

$ npm install -g bower

$ npm install -g bower-installer

$ bower install

$ bower-installer

```

### Use local versions of cpa.js and radiotag.js

If you want to use this client to change either [cpa.js](https://github.com/ebu/cpa.js)
or [radiotag.js](https://github.com/ebu/radiotag.js), you can use the following
instructions in order to link it to a local repo.

Clone the repository and create the link.

```bash
git clone https://github.com/ebu/cpa.js

cd cpa.js

bower link

```

The same applies to radiotag.js. 

Then, go to `cpa-client/device` and type:

```bash

bower link cpa.js
bower link radiotag.js

```

Don't forget to use `grunt watch` in cpa.js and radiotag.js folders in order
to compile the files when changed.

