define(['jquery', 'jquery.storage'], function($) {

  return {
    persistent: {
      put: function(key, value) {
        $.localStorage.set(key, value);
      },

      get: function(key) {
        console.log(key);
        return $.localStorage.get(key);
      },

      // Return the value of a stored object
      getValue: function(key, objKey) {
        console.log('GET ', key, objKey);
        var obj = this.get(key) || {};
        if (obj[objKey]) {
          return obj[objKey];
        }
        return null;
      },

      // Set the value of a stored object
      setValue: function(key, objKey, value) {
        var obj = $.localStorage.get(key) || {};
        obj[objKey] = value;
        this.put(key, obj);
      },

      'delete': function(key) {
        $.localStorage.set(key, null);
      }
    },

    volatile: {
      data: {},

      put: function(key, value) {
        this.data[key] = value;
      },

      // Return the value of a stored object
      getValue: function(key, objKey) {
        var obj = this.get(key) || {};
        if (obj[objKey]) {
          return obj[objKey];
        }
        return null;
      },

      // Set the value of a stored object
      setValue: function(key, objKey, value) {
        var obj = this.get(key) || {};
        obj[objKey] = value;
        this.put(key, obj);
      },

      get: function(key) {
        return this.data[key];
      },

      'delete': function(key) {
        delete this.data[key];
      },

      dump: function() {
        //Deep copy
        return $.extend(true, {}, this.data);
      }
    },

    reset: function() {
      this.volatile.data = {};
      $.localStorage.removeAll();
    }
  };
});

