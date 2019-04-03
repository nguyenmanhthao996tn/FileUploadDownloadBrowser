const fs = require('fs');

const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM(`...`);
const { document } = (new JSDOM(`...`)).window;

const express = require('express');
const app = express();
const port = 3000;
const contentsPath = __dirname + '\\contents\\';

const path = require('path');

app.use('/download', express.static(path.join(__dirname, 'contents')));

app.get('/', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });

    fs.readFile(__dirname + '\\index.html', null, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.write('File not found');
            res.end();
        } else {
            var dom = new JSDOM(data);

            fs.readdir(contentsPath, function (err, items) {
                if (err) {
                    res.writeHead(404);
                    res.write(err.toString());
                    res.end();
                } else {
                    var list = dom.window.document.getElementById('menu');
                    for (var i = 0; i < items.length; i++) {
                        var newItem = document.createElement("li");
                        var linkItem = document.createElement("a");
                        var text = document.createTextNode(items[i]);
                        linkItem.appendChild(text);
                        linkItem.setAttribute('href', 'download/' + items[i]);
                        newItem.appendChild(linkItem);
                        list.append(newItem);
                    }

                    res.write(dom.window.document.documentElement.innerHTML);
                    res.end();
                }
            });
        }
    });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));