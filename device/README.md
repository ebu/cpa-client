CPA Device Client
=================

This folder contains a stand-alone cpa device client. 

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

1. Clone the repository and go into it. 

```bash
git clone https://github.com/ebu/cpa.js

cd cpa.js

bower link

```

You can do the same for radiotag.js. 

Then, go to `cpa-client/device` and type:

```bash

bower link cpa.js
bower link radiotag.js

```

Don't forget to use `grunt watch` in cpa.js and radiotag.js folders in order
to compile the files when changed.
