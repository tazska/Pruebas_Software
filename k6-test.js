import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '10s', target: 5 },
    { duration: '20s', target: 20 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    errors: ['rate<0.1'],
    http_req_duration: ['p(95)<2000'],
  },
};

const BASE_URL = 'http://localhost:5000/api';

function getToken() {
  const payload = JSON.stringify({ username: 'admin', password: 'admin123' });
  const res = http.post(`${BASE_URL}/auth/login`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json().token;
}

export default function () {
  group('Public endpoints', () => {
    const res = http.get(`${BASE_URL}/products`);
    check(res, {
      'GET /products status 200': (r) => r.status === 200,
      'GET /products returns array': (r) => Array.isArray(r.json()),
    });
    errorRate.add(res.status !== 200);
  });

  group('Login', () => {
    const payload = JSON.stringify({ username: 'admin', password: 'admin123' });
    const res = http.post(`${BASE_URL}/auth/login`, payload, {
      headers: { 'Content-Type': 'application/json' },
    });
    check(res, {
      'POST /auth/login status 200': (r) => r.status === 200,
      'POST /auth/login has token': (r) => r.json('token') !== undefined,
    });
    errorRate.add(res.status !== 200);
  });

  group('Admin CRUD', () => {
    const token = getToken();
    const params = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    };

    const createPayload = JSON.stringify({
      name: 'K6 Test Product',
      description: 'Created during load test',
      price: 99.99,
      stock: 10,
      image_url: 'https://via.placeholder.com/150',
    });

    const createRes = http.post(`${BASE_URL}/products`, createPayload, params);
    check(createRes, {
      'POST /products status 201': (r) => r.status === 201,
    });
    errorRate.add(createRes.status !== 201);

    if (createRes.status === 201) {
      const productId = createRes.json('id');

      const updatePayload = JSON.stringify({
        name: 'K6 Updated Product',
        description: 'Updated during load test',
        price: 49.99,
        stock: 5,
      });
      const updateRes = http.put(`${BASE_URL}/products/${productId}`, updatePayload, params);
      check(updateRes, {
        'PUT /products/:id status 200': (r) => r.status === 200,
      });
      errorRate.add(updateRes.status !== 200);

      const deleteRes = http.del(`${BASE_URL}/products/${productId}`, null, params);
      check(deleteRes, {
        'DELETE /products/:id status 200': (r) => r.status === 200,
      });
      errorRate.add(deleteRes.status !== 200);
    }
  });

  sleep(1);
}
