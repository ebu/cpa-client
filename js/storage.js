
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
  storage.volatile = {};
  $.localStorage.delete('client_information');
};
