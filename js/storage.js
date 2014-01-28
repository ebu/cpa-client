
var storage = {
  persistent: {},
  volatile: {}
};

storage.persistent = {

  put: function(key, value) {
    $.localStorage.set(key, value);
  },

  get: function(key) {
    return $.localStorage.get(key);
  },

  // Return the value of a stored object
  getValue: function(key, objKey) {
    obj = this.get(key) || {};
    if(obj[objKey]) {
      return obj[objKey];
    }
    return null;
  },

  // Set the value of a stored object
  setValue: function(key, objKey, value) {
    obj = $.localStorage.get(key) || {};
    obj[objKey] = value;
    this.put(key, obj);
  },

  'delete': function(key) {
    $.localStorage.set(key, null);
  }

};

storage.volatile = {

  data: {},

  put: function(key, value) {
    this.data[key] = value;
  },

  get: function(key) {
    return this.data[key];
  },

  'delete': function(key) {
    delete this.data[key];
  },

  dump: function () {
    //Deep copy
    return $.extend(true, {}, this.data);
  }

};

storage.reset = function(){
  storage.volatile.data = {};
  localStorage.clear();
};
