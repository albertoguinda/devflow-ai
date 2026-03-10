/* eslint-disable @typescript-eslint/no-require-imports */
const en = require('../locales/en.json');
const es = require('../locales/es.json');
const enK = Object.keys(en);
const esK = Object.keys(es);
console.log('EN:', enK.length, 'ES:', esK.length);
const misEN = esK.filter(k => !en[k]);
const misES = enK.filter(k => !es[k]);
if (misEN.length) console.log('Missing in EN:', misEN);
if (misES.length) console.log('Missing in ES:', misES);
if (!misEN.length && !misES.length) console.log('PARITY OK');
