const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
var bodyParser = require('body-parser');
var rp = require('request-promise');

express()
  .use(bodyParser.json())
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
 
  .use('/', express.static(path.join(__dirname, 'public')))
  .get('/product', function(req, res) {

    var options = {
      method: 'POST',
      uri: 'https://api-stg.syf.com/oauth2/v1/token',
      form: {
        'grant_type': 'client_credentials',
        'client_id': process.env.CLIENT_ID,
        'client_secret': process.env.CLIENT_SECRET
      },
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      json: true // Automatically stringifies the body to JSON
  };
    
    rp(options)
        .then(function (parsedBody) {
            // POST succeeded...
            var accessToken = parsedBody.access_token;

            //make request to synchrony
            customerData = Array()
            i = 2
            // for(i=0;i<100;i++) {
              rp({
                method: 'GET',
                uri: 'https://api-stg.syf.com/m2020/credit/customers/' + i + '/purchaseStatistics',
                headers: {
                  'Authorization': 'Bearer ' + accessToken
                }

              })
                  // .then(function (customers) {
                    .then(function (customer) {
                      // customerData.push(customer)
                    
                    endRequest({data: JSON.stringify(customer)});
                  })
              // }

            // endRequest({data: JSON.stringify(parsedBody)});
            // endRequest({data: JSON.stringify(customerData)});
        })
        
        .catch(function (err) {
            // POST failed...
            endRequest({data: JSON.stringify(err)});
        });

    function endRequest(data){
      res.render('pages/product', data);
    }

  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
