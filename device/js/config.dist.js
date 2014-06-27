var config = {
  //Should be dynamic using for instance /tokeninfo endpoint
  domains: {
    'BBC1': {
        domain: 'http://local.ebu.io:8001/',
        id: '0.c221.ce15.ce1.dab'
    },
    'BBC2': {
        domain: 'http://local.ebu.io:8002/',
        id: '0.c222.ce15.ce1.dab'
    },
    'BBC3': {
        // id will default to station name if omitted
        domain: 'http://local.ebu.io:8003/'
    },
  }
};
