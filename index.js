var config = require('./config.js');
var flock = require('flockos');
var express = require('express');
var store = require('./store.js')
var nunjucks  = require('nunjucks')
var bodyParser = require('body-parser')
var url = require('url');

const app = express()

nunjucks.configure(`${__dirname}/views`, {
  autoescape: true,
  express   : app
})

app.use(express.static(`${__dirname}/public`))
app.set('view engine', 'html')
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))


flock.appId = config.appId;
flock.appSecret = config.appSecret;

app.use(flock.events.tokenVerifier);
app.post('/events', flock.events.listener);

flock.events.on('app.install', function (event, callback) {
    store.saveToken(event.userId, event.token);
    callback();
});

app.get('/', (req, res) => {
  res.render('index');
})

app.get('/board', (req, res) => {
  res.render('board');
})


app.post('/create', (req, res) => {
  let query = decodeURIComponent(req.headers.referer);
  let url_parts = url.parse(req.headers.referer, true);
  let flockEventObj = url_parts['query']['flockEvent']
  let userId = flockEventObj['userId']
  let chat = flockEventObj['chat']

  flock.callMethod('chat.sendMessage', store.getToken(userId), {
      to: chat,
      text: "Here is your server",
      attachments: [{
      "description": "drawing board",
      "views": {
          "widget": { "src": "https://drawingboard-qqtudaqxcu.now.sh/", "width": 400, "height": 400 }
      },
      "buttons": [{
          "name": "Send",
          "action": { "type": "openWidget", "desktopType": "modal", "mobileType": "modal", "url": "" },
          "id": "Send"
      }, {
          "name": "Cancel",
          "action": { "type": "openWidget", "desktopType": "sidebar", "mobileType": "modal", "url": "" },
          "id": "Cancel"
      }]
    }]
  })

})

flock.events.on('client.pressButton', function (event, callback) {
    console.log('opened widget')
});

app.listen(8080, function () {
    console.log('Listening on 8080');
});
