var fs = require('fs');

var context = {
    title: 'Flow',
    heading: 'Welcome to Flow'
};

var render = function render(template, url, context) {
    let content;
    var data = fs.readFileSync(template, 'utf8', (err, data)=>{
        if (err)
            throw err;
        else {
            content = data;
            instantiateText(context);
        }
    });
};
render(process.argv[2]);


function instantiateText(text) {
    return text.replace(/\{\{(\w+)\}\}/g, function(_, name) {
      return values[name];
    });
  }
