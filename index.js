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
            id = req.params.productId
            if (id == 1) {
              transactions = '/transactions'
            }
            else {
              transactions = '/transactions/' + id
            }
              rp({
                method: 'GET',
                uri: 'https://api-stg.syf.com/m2020/credit/customers/' + i + transactions,
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
      var id = parseInt(req.params.productId) - 1
      var mockedData = [
        {
          "id": 1,
          "name": "Under Armour Men's Tech Short sleeve T-Shirt",
          "description": "100% Polyester\n\
Imported\n\
Loose: Fuller cut for complete comfort\n\
UA Tech fabric is quick-drying, ultra-soft & has a more natural feel\n\
Moisture Transport System wicks sweat & dries fast\n\
Anti-odor technology prevents the growth of odor-causing microbes\n\
Material wicks sweat & dries really fast",
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
        },
        {
          "id": 2,
          "name": "Sweatpants",
          "description": "Made for life beyond the 9-to-5, sweatpants just got a grownup makeover.\n\
\n\
Micro-sanded french terry for softness and stretch \n\
Stealth pocket\n\
Ribbed cuffs\n\
95% Cotton / 5% Stretch\n\
Machine wash cold and tumble dry low\n\
Imported",
          "image": "/images/1.jpg", //this is updated below
          "sku": "HDE-251",

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
        },
        {
          "id": 3,
          "name": "John Two-Button Lambskin Leather Blazer",
          "description": "Shell: 100% New Zealand lambskin leather; Lining: 100% polyester\n\
Contoured fit through chest and waist to give a modern and tailored appearance\n\
One-button closure front; Narrow notch lapel; Single back vent; Decorative buttons at cuffs\n\
One chest pocket and two angled flap pockets; Three interior pockets",
          "image": "/images/1.jpg", //this is updated below
          "sku": "HDE-246",

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
        },
        {
          "id": 4,
          "name": "Goodyear Ultra Grip® Performance 2",
          "description": "An ultra high-performance tire that offers strong grip to help maneuver through winter conditions.",
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
        },
        {
          "id": 5,
          "name": "Echo Dot",
          "description": "A Certified Refurbished Echo Dot is refurbished, tested, and certified to look and work like new\n\
Echo Dot (2nd Generation) is a hands-free, voice-controlled device that uses Alexa to play music, control smart home devices, make calls, send and receive messages, provide information, read the news, set alarms, read audiobooks from Audible, and more",
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
        },
        {
          "id": 6,
          "name": "Keurig K55/K-Classic Coffee Maker",
          "description": "The Classic Keurig K-Cup Single Serve Coffee Maker includes 4 K-Cup pods, a water filter handle and 2 water filters to help your beverages taste their best.\n\
BREWS MULTIPLE K-CUP POD SIZES: (6, 8, 10 oz.) – the most popular K-Cup pod brew sizes. Use the 6oz brew size to achieve the strongest brew.",
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
        },
        {
          "id": 7,
          "name": "Yeokou Men's Casual Slim Full Zip",
          "description": "Fabric:38% Cashmere 20% Cotton 22% Wool 20% Anti-pilling fibers\n\
Machine wash\n\
Long sleeve zipper knit sweater jacket\n\
Classic stand collar, two slant deep functional pockets, not fake",
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
        },
        {
          "id": 8,
          "name": "H2H Mens Knitted Slim Fit Pullover Sweater",
          "description": "Snug fit, long sleeve, fine knitted fabric, shawl collar with with one button point decoration on neck-line, thermal and basic designed turtleneck pullover sweaters which you makes you fashion and handsome.",
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
        },
        {
          "id": 9,
          "name": "Instant Pot Duo Mini Pressure Cooker, Slow Cooker, Rice Cooker",
          "description": "All the features of the Instant Pot duo, the bestselling electric pressure cooker in North America now available in a 3 Qt compact format\n\
The perfect companion to your existing Instant Pot, use it for side dishes, vegetables or other accompaniments such as rice",
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
        },
        {
          "id": 10,
          "name": "PUMA Men's Axelion Sneaker",
          "description": "Synthetic\n\
Imported\n\
Rubber sole\n\
Shaft measures approximately low-top from arch\n\
Run-Train Performance Sneaker\n\
Tazon",
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
        },
        {
          "id": 9,
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
        },
        {
          "id": 9,
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
        }
      ]
      
      mockedData[id].image = getImageUrl(id + 1);
      mockedData[id].reviews = [
        {
          title: "It's great!",
          text: "I love the color and it's a great value for the price! Would highly recommend!"
        },
        {
          title: "Meh",
          text: "Had a weird factory smell. I returned it after the smell persisted for a few days."
        },
        {
          title: "Perfect for a summer day",
          text: "It's light enough to carry with you and not havve to worry about losing it."
        },
      ];
    
      function getImageUrl(prodId){
        return "/images/" + (prodId % 12) + ".jpg";
      }

      res.render('pages/product', mockedData[id]);
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
        name: "Sweatpants"
      }, 
      {
        id: 3,
        name: "John Two-Button Lambskin Leather Blazer"
      }, 
      {
        id: 4,
        name: "Goodyear Ultra Grip® Performance 2"
      }, 
      {
        id: 5,
        name: "Echo Dot"
      }, 
      {
        id: 6,
        name: "Keurig K55/K-Classic Coffee Maker"
      }, 
      {
        id: 7,
        name: "Yeokou Men's Casual Slim Full Zip"
      }, 
      {
        id: 8,
        name: "H2H Mens Knitted Slim Fit Pullover Sweater"
      }, 
      {
        id: 9,
        name: "Instant Pot Duo Mini Pressure Cooker, Slow Cooker, Rice Cooker"
      }, 
      {
        id: 10,
        name: "PUMA Men's Axelion Sneaker"
      }, 
    ];

    res.render('pages/index', {data});
  })

  .use(express.static(path.join(__dirname, 'public')))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))

function getItem() {

}