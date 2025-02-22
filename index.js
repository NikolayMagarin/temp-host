const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 8080;

const mainHtmlPath = path.join(__dirname, 'public', 'index.html');
const notFoundHtmlPath = path.join(__dirname, 'public', 'notFound.html');

app.get('/', (req, res) => {
  res.sendFile(mainHtmlPath);
});

app.get('/:page', (req, res) => {
  const htmlPath = path.join(
    __dirname,
    'public',
    req.params.page,
    'index.html'
  );

  if (fs.existsSync(htmlPath)) {
    res.sendFile(htmlPath);
  } else {
    res.sendFile(notFoundHtmlPath);
  }
});

app.get('/:page/images/:image', (req, res) => {
  const imagePath = path.join(
    __dirname,
    'public',
    req.params.page,
    'images',
    req.params.image
  );

  if (fs.existsSync(imagePath)) {
    res.sendFile(imagePath);
  } else {
    res.end();
  }
});

app.get('/images/:image', (req, res) => {
  const imagePath = path.join(__dirname, 'public', 'images', req.params.image);

  if (fs.existsSync(imagePath)) {
    res.sendFile(imagePath);
  } else {
    res.end();
  }
});

app.get('*', (req, res) => {
  res.sendFile(notFoundHtmlPath);
});

app.listen(PORT);
