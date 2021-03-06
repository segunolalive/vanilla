"use strict";
const fs = require("fs");
const url = require('url');

const errors = require('./errors');
const Engine = require('../engine/engine');
const engine = new Engine();

var views = module.exports = Object.create(null);


function respond(response, status, data, type) {
  response.writeHead(status, {
    "Content-Type": type || "text/plain"
  });
  response.end(data);
}

function respondJSON(response, status, data) {
  respond(response, status, JSON.stringify(data),
          "application/json");
}


const rooms = [ 'private', 'javascript', 'python', 'php'];

var latestChats = [];


views.home = (request, response) => {
    fs.readFile('templates/index.html', 'utf8', (err, data)=>{
        if (err) {
            errors.reportError(500, response, err);
        } else {
            let template = data;
            let context = {
                rooms : rooms
            }
            let page = engine.render(template, context);
            response.end(page);
        }
    })
};


views.archive = (request, response) => {
    fs.readFile('templates/archive.html', 'utf8', (err, data)=>{
        if (err) {
            errors.reportError(500, response);
        } else {
            let template = data;
            let file = './public/posts.json';
            fs.readFile(file, 'utf8', (err, data)=>{
                if (err)
                    errors.reportError(500, response);
                else {
                    let posts = data.split('\n');
                    posts = posts.slice(0, -1).map((post)=>{
                        return JSON.parse(post);
                    });
                    let context= {
                        posts: posts,
                        title: 'Vanilla'
                    };
                    let page = engine.render(template, context);
                    response.end(page);
                }
            })
        }
    })
};

// Fix this view
views.getRooms = (request, response) => {
    fs.readFile('.public/posts.json', 'utf8', (err, data) => {
        if (err)
            console.error(err.toString());
        else{
            response.end(data);
        }
    });
};


views.getRoom = (request, response, room) => {
    if (!room in rooms)
        respond(response, 404, `chat room, ${room} not found`);
    else {
        // server sent event logic here
        if (request.headers.accept &&
            request.headers.accept == 'text/event-stream') {
            sendSSE(request, response, room);
            } else {
                respondJSON(response, 200, rooms[room]);
            }
        }
};

function sendSSE(request, response, room) {
    var id = 0;
    var chat = latestChats[id];

    if (typeof(request.headers["last-event-id"]) !== 'undefined') {
        let lastId = Number(request.headers["last-event-id"]);
        id = lastId + 1;
        if (latestChats[id]) {
            chat = latestChats[id];
            constructSSE(response, id, chat);
        } else if (latestChats[lastId]) {
            constructSSE(response);
        } else if (chat) {
            constructSSE(response, id, chat);
        }
    } else if (chat) {
        constructSSE(response, id, chat);
    } else {
        constructSSE(response);
    }
    response.end();
};


function constructSSE(response, id, chat, retry) {
    response.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });

    if (arguments.length < 2) {
        response.write(': \n\n');
    } else {
        if (retry)
            response.write('retry: ' + retry);
        response.write('id: ' + id + '\n');
        response.write('data: ' + chat + '\n\n');
    }
};


views.postMessage = function postMessage(request, response, room) {
    readStreamAsJSON(request, (error, data)=>{
        if (error) {
            respond(response, 400, error.toString());
        } else if (!room in rooms) {
            respond(response, 404, `No chatroom with name ${room}`);
        } else {
            var parsedData = data;
            var date = new Date();
            parsedData["date"] = date;
            var jsonData = JSON.stringify(parsedData) + '\n';
            latestChats.push(JSON.stringify(parsedData));
            // fix path for appendFile function.
            // var path = urlToPath(request.url);
            var path = './public/posts.json'; // change this later
            fs.appendFile(path, jsonData, (err)=> {
                if (err)
                    console.error(err.toString());
            });
            respond(response, 204);
        }
    });
};

function urlToPath(requestUrl) {
  var path = url.parse(requestUrl).pathname;
  var decoded = decodeURIComponent(path);
  return "." + decoded.replace(/(\/|\\)\.\.(\/|\\|$)/g, "/");
};


function readStreamAsJSON(stream, callback) {
    var data = "";
        stream.on("data", (chunk) => {
        data += chunk;
    });
    stream.on("end", () => {
        var result, error;
        try {
            result = JSON.parse(data);
        } catch (e) {
            error = e;
        }
        callback(error, result);
    });
    stream.on("error", (error) => {
        callback(error);
    });
};
