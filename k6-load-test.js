import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const loginDuration = new Trend('login_duration');
const dashboardDuration = new Trend('dashboard_duration');

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 20 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    errors: ['rate<0.1'],
  },
};

export default function () {
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res1 = http.get(`${BASE_URL}/login`, params);
  check(res1, {
    'login page status 200': (r) => r.status === 200,
    'login page has title': (r) => r.body.includes('تسجيل الدخول'),
  }) || errorRate.add(1);
  loginDuration.add(res1.timings.duration);

  sleep(1);

  const res2 = http.get(`${BASE_URL}/forgot-password`, params);
  check(res2, {
    'forgot password status 200': (r) => r.status === 200,
  }) || errorRate.add(1);

  sleep(1);

  const res3 = http.get(`${BASE_URL}/api/health`, params);
  check(res3, {
    'health endpoint status 200': (r) => r.status === 200,
  }) || errorRate.add(1);

  sleep(Math.random() * 3 + 1);
}
