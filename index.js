const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
var bodyParser = require('body-parser');
var rp = require('request-promise');
var Q = require('q')

function getTransactionData(accessToken, customerId, transaction, transactionData){
  var deferred = Q.defer();
  // FS.readFile("foo.txt", "utf-8", function (error, text) {
  //     if (error) {
  //         deferred.reject(new Error(error));
  //     } else {
  //         deferred.resolve(text);
  //     }
  // });
//           if ('links' in response) {
  rp({
    method: 'GET',
    uri: 'https://api-stg.syf.com/m2020/' + transaction.links.href,
    headers: {
      'Authorization': 'Bearer ' + accessToken
    },
    json: true // Automatically stringifies the body to JSON

  })
  .then(function (transaction) {
    console.log('next call: ')
    console.log(transaction.itemType)
    transactionData.push(transaction.itemType)
    return getTransactionData(accessToken, customerId, transaction, transactionData)
  })
  .catch(function (err) {
    deferred.resolve(transactionData);
    // return transactionData//endRequest({products: JSON.stringify(transactions)});
  })
  console.log(transactionData)
  return deferred.promise;
}

express()
  .use(bodyParser.json())
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
 
  // .use('/', express.static(path.join(__dirname, 'public')))
  .get('/home', function(req, res) {
    // var products = [
    //   {
    //     'name' : 'Flower Skin',
    //     'image' : 'images/1.jpg'
    //   },
    //   {
    //     'name' : 'Flower Skin',
    //     'image' : 'images/2.jpg'
    //   },
    //   {
    //     'name' : 'Flower Skin',
    //     'image' : 'images/3.jpg'
    //   },
    //   {
    //     'name' : 'Flower Skin',
    //     'image' : 'images/4.jpg'
    //   },
    // ]
    // res.render('pages/home', products)
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
            var transactionData = []
            customerId = 2
            rp({
              method: 'GET',
              // uri: 'https://api-stg.syf.com/m2020/credit/customers/' + i + '/purchaseStatistics',
              uri: 'https://api-stg.syf.com/m2020/credit/customers/' + customerId + '/transactions',
              headers: {
                'Authorization': 'Bearer ' + accessToken
              },
              json: true // Automatically stringifies the body to JSON

            })
            .then(function (transaction) {
              console.log('first call: ')
              console.log(transaction)
              transactionData.push(transaction.itemType)
              getTransactionData(accessToken, customerId, transaction, transactionData)
              .then(function(final){
                endRequest({data: JSON.stringify(final)});
              })
            })
        })
        
        .catch(function (err) {
            // POST failed...
            endRequest({data: JSON.stringify(err)});
        });

    function endRequest(products){
      res.render('pages/home', products);
    }
  })

  .get('/product/:productId', function(req, res) {

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
                uri: 'https://api-stg.syf.com/m2020/credit/customers/' + i + '/transactions/' + req.params.productId,
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
      console.log(data);
      var mockedData = {
        "id": req.params.productId,
        "name": "Green Hoodie",
        "description": "Soft, carbon-brushed thermal knit, with plush sherpa body and hood lining and lightweight jersey sleeve lining.",
        "image": "/images/1.jpg", //this is updated below
        "sku": "HDE-001",

        "retailer": "Retailer1",
        "date": "2018-09-23",
        "amount": "101.23",
        "itemType": "clothes",
        "links": [
            {
                "href": "/credit/customers/2/transactions/3",
                "rel": "nextTransaction",
                "method": "GET"
            }
        ]
      };
      
      mockedData.image = getImageUrl(mockedData.id);
    
      function getImageUrl(prodId){
        return "/images/" + (prodId % 12) + ".jpg";
      }

      res.render('pages/product', mockedData);
    }

  })

  .get('/', function(req, res){
    var data = [
      {
        id: 1,
        name: "Hoodie"
      }, 
      {
        id: 2,
        name: "Plant"
      }, 
      {
        id: 3,
        name: "Artwork"
      }, 
      {
        id: 4,
        name: "Hoodie"
      }, 
      {
        id: 5,
        name: "Plant"
      }, 
      {
        id: 6,
        name: "Artwork"
      }, 
      {
        id: 7,
        name: "Hoodie"
      }, 
      {
        id: 8,
        name: "Plant"
      }, 
      {
        id: 9,
        name: "Artwork"
      }, 
    ];

    res.render('pages/index', {data});
  })

  .use(express.static(path.join(__dirname, 'public')))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))

function getItem() {

}