
require.config({
  baseUrl: 'js',
  paths: {
    //Run bower-installer to download the following dependencies
    'bootstrap':      '../bower_components/bootstrap/dist/js/bootstrap',
    'cpa':            '../bower_components/cpa.js/dist/cpa',
    'jquery':         '../bower_components/jquery/dist/jquery.min',
    'dateformat':     '../bower_components/jquery-dateformat/dist/dateFormat.min',
    'jquery.storage': '../bower_components/jquery-storage/jquery.storageapi',
    'logger':         '../bower_components/js-logger/src/logger',
    'ejs':            '../bower_components/ejs/index',
    'machina':        '../bower_components/machina/lib/machina.min',
    'radiotag':       '../bower_components/radiotag.js/dist/radiotag',
    'lodash':         '../bower_components/lodash/dist/lodash.min'
  },
  shim: {
    lodash: {
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
