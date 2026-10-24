// jest.setup.js
// Polyfill for TextEncoder/TextDecoder needed by qrcode library
const { TextEncoder, TextDecoder } = require('util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
