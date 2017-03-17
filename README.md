# VanillaChat

### A vanilla MVC node.js project to explore web development. No frameworks or
### external dependencies besides mime which I used because I didn't want to write
### a mime lookup function myself.


It includes a:

* Web server.

* Url Router.

* A template engine for server-side rendering.

* A service worker.

It utilizes the Event Source and Notification APIs in the frontend.

To run it locally, clone this repo, navigate to the root folder then run:

`npm install`

Then:

`node server/server`

Or you provide an optional PORT

`node server\server PORT`

Point your browser to `Localhost:8000` or `Localhost:PORT` if your provided a port number.

You can check out the live demo [here](https://vanillachat.herokuapp.com "vanillachat")
