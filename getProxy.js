var request = require('request');

//Get proxy from gimmeproxy.com and check this proxy with a request to researchgate
module.exports = function(proxy) {
  return {
    //Get new proxy
    getNewProxy: function(myRequest, callback, id) {
      let options= {
        url: 'https://gimmeproxy.com/api/getProxy?protocol=http'
      };
      myRequest(options, callback.bind({id: id}));
    },
    //Check the proxy tunneling
    checkProxy: function(myRequest, callback, id) {
      let options= {
        url: 'https://www.researchgate.net/profile/Paco_Bogonez-Franco',
        proxy: proxy
      };
      myRequest(options, callback.bind({id: id}));
    }
  };
};
