// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import path from 'path';
import fs from 'fs';
import http from 'http';
import https from 'https';
import etag from 'etag';
import {getCwd} from '../../util.js'
import compile from '../../scripts/compile.js'

const _proxy = (req, res, u) => new Promise((resolve, reject) => {
  // console.log('redirect asset 1', {u});

  // res.setHeader('Access-Control-Allow-Origin', '*');
  // res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  // res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  // res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.redirect(u);
  return;

  if (/^\//.test(u)) {
    const cwd = getCwd();
    u = path.join(cwd, u);
    /* console.log('redirect asset 2', {
      u,
    }); */

    const rs = fs.createReadStream(u);
    rs.pipe(res);
    rs.on('error', reject);
  } else {
    /* console.log('redirect asset 3', {
      u,
    }); */

    const proxyReq = /^https:/.test(u) ? https.request(u) : http.request(u);
    /* for (const header in req.headers) {
      proxyReq.setHeader(header, req.headers[header]);
    } */
    proxyReq.on('response', proxyRes => {
      for (const header in proxyRes.headers) {
        res.setHeader(header, proxyRes.headers[header]);
      }
      // res.setHeader('Access-Control-Allow-Origin', '*');
      res.statusCode = proxyRes.statusCode;
      proxyRes.pipe(res);
      resolve();
    });
    proxyReq.on('error', err => {
      console.error(err.stack);
      res.statusCode = 500;
      res.end();
      resolve();
    });
    proxyReq.end();
  }
});

export default async function handler(req, res) {
  /* if (/\.glb/.test(req.url)) {
    console.log('\n\n\n\ncompile', req.headers, req.url, '\n\n\n\n');
  } */
  // console.log('got url', {u: req.url});

  const u = req.url
    .replace(/^\/([a-zA-Z0-9]+:)/, '$1')
    .replace(/^([a-zA-Z0-9]+:\/(?!\/))/, '$1/');
  if (u) {
    // XXX sec-fetch-dest is not supported by Safari
    const dest = req.headers['sec-fetch-dest'];
    // const accept = req.headers['accept'];
    if (/* /^image\//.test(accept) || */['empty', 'image'].includes(dest)) {
      // console.log('\n\n\n\ncompile', req.headers, req.url, '\n\n\n\n');
      await _proxy(req, res, u);
    } else {
      let resultUint8Array, err;
      try {
        resultUint8Array = await compile(u);
      } catch (e) {
        err = e;
      }
      if (!err) {
        const resultBuffer = Buffer.from(resultUint8Array);
        const et = etag(resultBuffer);
        res.setHeader('ETag', et);
        // check if-none-match (multiple)
        if (req.headers['if-none-match'] && req.headers['if-none-match'].split(',').includes(et)) {
          res.statusCode = 304;
          res.end();
        } else {
          res.setHeader('Content-Type', 'application/javascript');
          // res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          res.setHeader('Cache-Control', 'no-cache');
          res.end(resultBuffer);
        }
      } else {
        console.warn(err);
        res.status(500).send(err.stack);
      }
    }
  } else {
    res.status(404).send('not found');
  }
}
