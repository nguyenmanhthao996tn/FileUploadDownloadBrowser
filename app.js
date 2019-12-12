const fs = require('fs');
const jsdom = require("jsdom");
const path = require('path');

const { JSDOM } = jsdom;
const { window } = new JSDOM(`...`);
const { document } = (new JSDOM(`...`)).window;

const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const port = 3000;
const contentsPath = path.join(__dirname, 'contents') ;

app.use(fileUpload());
app.use('/download', express.static(path.join(__dirname, 'contents')));

app.get('/*', (req, res) => {
    fs.readFile(path.join(__dirname, 'index.html'), null, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.write('File not found');
            res.end();
        } else {
            var dom = new JSDOM(data);

            fs.readdir(path.join(contentsPath, req.url), async function (err, items) {
                if (err) {
                    try {
                        res.writeHead(404);
                        res.end();
                    } catch (reject){
                        console.log(reject);
                    }
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/html' });

                    var list = dom.window.document.getElementById('menu');
                    for (var i = 0; i < items.length; i++) {
                        var newItem = document.createElement("li");
                        var linkItem = document.createElement("a");
                        try {
                            stats = await fs.promises.stat(path.join(contentsPath, items[i]))
                            if (stats.isFile()){
                                linkItem.setAttribute('href', 'download/' + items[i]);
                                text = document.createTextNode(items[i]);
                            }
                            else if (stats.isDirectory()){
                                linkItem.setAttribute('href',  items[i]);
                                text = document.createTextNode(items[i]+'/');
                            }
                        } catch (err) {
                            console.log(err);
                            linkItem.setAttribute('href', 'download/' + items[i]);
                            text = document.createTextNode(items[i]);
                        }
                        
                        linkItem.appendChild(text);
                        
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

app.post('/upload', function (req, res) {
    if (Object.keys(req.files).length == 0) {
        return res.status(400).send('No files were uploaded.');
    }

    let sampleFile = req.files.sampleFile;

    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv(path.join(__dirname, '/uploads/', sampleFile.name), function (err) {
        if (err) {
            return res.status(500).send(err);
        }
        res.sendFile(path.join(__dirname, '/uploaded.html'));
    });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));