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
app.use(bodyParser.urlencoded({ extended: true}))


flock.appId = config.appId;
flock.appSecret = config.appSecret;

app.use(flock.events.tokenVerifier);
app.post('/events', flock.events.listener);

flock.events.on('app.install', function (event, callback) {
    store.saveToken(event.userId, event.token);
    callback();
});

flock.events.on('client.openAttachmentWidget', function (event, callback) {
  console.log('Modal Widget Opened', event)
})

app.get('/', (req, res) => {
  res.render('index');
})

app.get('/board', (req, res) => {
  res.render('board');
})


app.post('/create', (req, res) => {
  let userId = req.body.userId
  let chat = req.body.chat
  let text = req.body.text
  let token = req.body.token

  flock.callMethod('chat.sendMessage', token, {
      to: chat,
      text: text,
  }, function(error, response){
    if (!error) {
        console.log('uid for message: ' + response.uid);
    } else {
        console.log('error sending message: ' + error);
    }
  })

})

flock.events.on('client.pressButton', function (event, callback) {
    console.log('opened widget')
});

app.listen(8080, function () {
    console.log('Listening on 8080');
});
