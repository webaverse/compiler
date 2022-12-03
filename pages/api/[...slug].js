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

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

  if (/^\//.test(u)) {
    const cwd = getCwd();
    u = path.join(cwd, u);
    
    // console.log('fetch file locally', {cwd, u});

    const rs = fs.createReadStream(u);
    rs.pipe(res);
    rs.on('error', err => {
      console.warn('got error', err.stack);
      reject(err);
    });
  } else {
    res.redirect(u);
  }
});

export default async function handler(req, res) {
  /* if (/\.glb/.test(req.url)) {
    console.log('\n\n\n\ncompile', req.headers, req.url, '\n\n\n\n');
  } */
  // console.log('got url', {u: req.url});

  const u = req.url
    .replace(/^\/([a-zA-Z0-9]+:)/, '$1') // remove initial slash
    .replace(/^([a-zA-Z0-9]+:\/(?!\/))/, '$1/'); // add second slash to protocol, since it is truncated
  if (u) {
    // XXX note: sec-fetch-dest is not supported by Safari
    const dest = req.headers['sec-fetch-dest'];
    // const accept = req.headers['accept'];
    if (/* /^image\//.test(accept) || */['empty', 'image'].includes(dest) || dest.includes('github.io')) {
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
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
          res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
          res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
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
