/**
 * HTTP Client Helper for E2E Test Suites
 * Facilitates HTTP requests, cookie jar management, header analysis, and authentication.
 */

const http = require('http');
const https = require('https');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const TEST_PORT = process.env.PORT || 3000;
const BASE_HOST = '127.0.0.1';
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_change_me_in_prod';

function parseCookies(setCookieHeader) {
  if (!setCookieHeader) return {};
  const cookies = {};
  const array = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
  for (const str of array) {
    const parts = str.split(';')[0].split('=');
    if (parts.length >= 2) {
      cookies[parts[0].trim()] = parts.slice(1).join('=').trim();
    }
  }
  return cookies;
}

function request(options = {}) {
  return new Promise((resolve, reject) => {
    const method = (options.method || 'GET').toUpperCase();
    const reqPath = options.path || '/';
    const port = options.port || TEST_PORT;
    const host = options.host || BASE_HOST;
    const headers = Object.assign({}, options.headers || {});

    let postData = null;
    if (options.body !== undefined && options.body !== null) {
      if (typeof options.body === 'object' && !(options.body instanceof Buffer)) {
        if (headers['Content-Type'] === 'application/x-www-form-urlencoded') {
          const params = new URLSearchParams();
          for (const [k, v] of Object.entries(options.body)) {
            params.append(k, v);
          }
          postData = params.toString();
        } else {
          headers['Content-Type'] = 'application/json';
          postData = JSON.stringify(options.body);
        }
      } else {
        postData = String(options.body);
      }
      headers['Content-Length'] = Buffer.byteLength(postData);
    }

    if (options.cookies) {
      if (typeof options.cookies === 'string') {
        headers['Cookie'] = options.cookies;
      } else if (typeof options.cookies === 'object') {
        headers['Cookie'] = Object.entries(options.cookies)
          .map(([k, v]) => `${k}=${v}`)
          .join('; ');
      }
    }

    const reqOptions = {
      hostname: host,
      port: port,
      path: reqPath,
      method: method,
      headers: headers
    };

    const req = http.request(reqOptions, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const rawBody = Buffer.concat(chunks).toString('utf8');
        let parsedJson = null;
        try {
          parsedJson = JSON.parse(rawBody);
        } catch (e) {}

        const setCookieHeader = res.headers['set-cookie'];
        const cookies = parseCookies(setCookieHeader);

        resolve({
          status: res.statusCode,
          statusCode: res.statusCode,
          headers: res.headers,
          body: rawBody,
          json: parsedJson,
          location: res.headers['location'] || null,
          cookies: cookies,
          setCookie: setCookieHeader
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function get(path, headers = {}, cookies = null) {
  return await request({ method: 'GET', path, headers, cookies });
}

async function post(path, body = null, headers = {}, cookies = null) {
  return await request({ method: 'POST', path, body, headers, cookies });
}

async function postForm(path, formData = {}, headers = {}, cookies = null) {
  return await request({
    method: 'POST',
    path,
    body: formData,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', ...headers },
    cookies
  });
}

async function options(path, headers = {}) {
  return await request({ method: 'OPTIONS', path, headers });
}

async function loginAsAdmin(email = 'admin@tiffanywebb.com', password = 'password123') {
  const res = await postForm('/login', { email, password });
  let token = null;
  let cookieString = '';
  if (res.cookies && res.cookies.auth_token) {
    token = res.cookies.auth_token;
    cookieString = `auth_token=${token}`;
  }
  return { res, token, cookieString };
}

function generateToken(payload = { id: 1, email: 'admin@tiffanywebb.com', name: 'Admin User', role: 'admin' }, expiresIn = '7d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

module.exports = {
  request,
  get,
  post,
  postForm,
  options,
  loginAsAdmin,
  generateToken,
  TEST_PORT,
  BASE_HOST,
  JWT_SECRET
};
