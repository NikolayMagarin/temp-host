const express = require('express');
const path = require('path');
const fs = require('fs');

const fetch = require('node-fetch');

const dotevn = require('dotenv');
const assert = require('assert');

dotevn.config();

function getEnvValue(key) {
  const val = process.env[key];
  assert(val, `Please set ${key} in environment`);
  return val;
}

const config = {
  selfPingSecret: getEnvValue('SELF_PING_SECRET'),
  port: 8080,
};

const app = express();

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

startSelfPing(app);

app.listen(config.port);

function useSelfPingSecret(req, res, next) {
  if (req.body?.selfPingSecret === config.selfPingSecret) {
    next();
  } else {
    res.status(403).json({ ok: false, data: 'Not allowed' });
  }
}

function startSelfPing(app) {
  const port = config.port;
  const selfUrl = process.env.SELF_URL || `http://localhost:${port}`;

  app.post(
    '/self-ping',
    express.json(),
    useSelfPingSecret,
    function (req, res) {
      setTimeout(() => {
        fetch(selfUrl + '/self-ping', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            selfPingSecret: config.selfPingSecret,
          }),
        }).catch();
      }, 30_000);
      res.json({ ok: true, status: 'alive' });
    }
  );

  fetch(selfUrl + '/self-ping', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      selfPingSecret: config.selfPingSecret,
    }),
  })
    .then(() => {
      console.log('self ping loop activated');
    })
    .catch((err) => {
      console.error(err);
      console.log('cannot activate self ping loop');
    });
}
