var config = {
  //Should be dynamic using for instance /tokeninfo endpoint
  domains: {
    'BBC1': 'http://local.ebu.io:8001/',
    'BBC2': 'http://local.ebu.io:8002/',
    'BBC3': 'http://local.ebu.io:8003/'
  },
  apBaseUrl: 'http://local.ebu.io:8000/',
  modes: {
    'BBC1': { anonymous: false, client: true, user: true },
    'BBC2': { anonymous: false, client: true, user: true },
    'BBC3': { anonymous: false, client: true, user: true }
  }
};
