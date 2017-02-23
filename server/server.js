const http = require("http");

const fileServer = require('./fileServer');
const Router = require('./router');
const views = require('./views');


const router = new Router();
const PORT = process.env.PORT || 8000;


http.createServer(function(request, response) {
  request.on('error', (err)=> {
    console.error(err);
    response.statusCode = 400;
    response.end();
  });
  response.on('error', function(err) {
    console.error(err);
  });

  if (!router.resolve(request, response))
      fileServer(request, response);
}).listen(PORT);


router.add('GET', /^\/$/, views.home);
router.add('GET', /^\/archive$/, views.archive);
router.add('GET', /^\/rooms$/, views.getRooms);
router.add('GET', /^\/rooms\/([^\/]+)$/, views.getRoom);
router.add('POST', /^\/rooms\/([^\/]+)$/, views.postMessage);
