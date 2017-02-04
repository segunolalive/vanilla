var message_form = document.querySelector('.message_form');
message_form.addEventListener('submit', handleMessage, false);


function elt(tag, attributes) {
    var node = document.createElement(tag);
    if (attributes){
        for (attr in attributes) {
            if (attributes.hasOwnProperty(attr))
                node.setAttribute(attr, attributes[attr])
        }
    }
    for (var i = 2; i < arguments.length; i++) {
        var child = arguments[i];
        if (typeof child == "string")
          child = document.createTextNode(child);
        node.appendChild(child);
      }
    return node;
}

function setName() {
    if (!localStorage.name) {
        let name = prompt('Please enter your name');
        localStorage.setItem('name', name);
    }
}

function handleMessage(event) {
    let name;
    if (!localStorage.name) {
        name = prompt('Please enter your name');
        localStorage.setItem('name', name);
    } else {
        name = localStorage.getItem('name')
    }
    var inputs = message_form.elements;
    // var name = inputs['username'].value;
    var message = inputs['message'].value;
    var payload = {
        name: name,
        message: message,
    };
    // inputs['username'].value = '';
    inputs['message'].value = '';

    ajaxRequest('/rooms/private', 'POST', payload);
    event.preventDefault();
}


function ajaxRequest(url, method, data) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    if (data) {
        xhr.setRequestHeader("Content-type", "application/json");
        var payload = JSON.stringify(data);
    }
    xhr.send(payload);
}



// Server Response

function getTime(date) {
    var date = new Date(date);
    var hours = (date.getHours() > 9)
                ? date.getHours()
                : '0' + date.getHours();
    var minutes = (date.getMinutes() > 9)
                    ? date.getMinutes()
                    : '0' + date.getMinutes();
    return hours + ':' + minutes;
}

function scrollUp (el) {
    if (!(el.scrollHeight - el.scrollTop === el.clientHeight)) {
        window.scrollTo(0, (el.scrollHeight));
    }
}

function updateDOM(data) {
    var div = elt('div', {class: 'messagePanel'});
    var namePara = elt('p', {class: 'username'});
    namePara.textContent = data.name + ' says:';
    var time = elt('span', {class: 'time'})
    time.textContent = getTime(data.date);
    var messagePara = elt('p', {class: 'messageBody'});
    messagePara.textContent = data.message;

    div.appendChild(time);
    div.appendChild(namePara);
    div.appendChild(messagePara);

    var messagesDiv = document.getElementById('messages');
    messagesDiv.appendChild(div);
    scrollUp(messagesDiv);
}


if (window.EventSource) {
    var source = new EventSource('/rooms/private');
    source.addEventListener('message', sseHandler, false);
}

function sseHandler (event) {
    try {
        let responseData = JSON.parse(event.data);
        updateDOM(responseData);
    } catch (e) {
        console.error(e);
    }
}
