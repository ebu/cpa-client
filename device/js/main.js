
require.config({
  baseUrl: 'js',
  paths: {
    //Run bower-installer to download the following dependencies
    'jquery':      '../lib/jquery/jquery',
    'jquery.storage': '../lib/jquery-storage/jquery.storageapi',
    'dateformat':  '../lib/jquery-dateformat/dateFormat.min',
    'bootstrap':   '../lib/bootstrap/bootstrap',
    'ejs':         '../lib/ejs/index',
    'machina':     '../lib/machina/machina',
    'underscore':  '../lib/underscore/underscore',
    'logger':      '../lib/js-logger/logger',
    'cpa':         '../lib/cpa.js/cpa.min',
    'radiotag':    '../lib/radiotag.js/radiotag.min'
  },
  shim: {
    underscore: {
      exports: '_'
    },
    jquery: {
      exports: '$'
    },
    'jquery.storage': ['jquery'],
    ejs: {
      exports: 'EJS'
    },
    dateformat: {
      exports: 'DateFormat.format'
    }
  }
});

require(['app-fsm']);
