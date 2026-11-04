import { describe, it, before, after } from 'node:test';
import * as assert from 'node:assert';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './app.module';

describe('Wyxan Mini Browser Backend Integration', () => {
  let app: INestApplication;
  let baseUrl: string;

  before(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.listen(0);
    const addr = app.getHttpServer().address();
    baseUrl = `http://127.0.0.1:${addr.port}`;
  });

  after(async () => {
    if (app) {
      await app.close();
    }
  });

  it('GET /users returns seeded user profiles', async () => {
    const res = await fetch(`${baseUrl}/users`);
    assert.strictEqual(res.status, 200);
    const users = (await res.json()) as Array<{ name: string }>;
    assert.ok(users.length >= 4);
    assert.ok(users.some((u) => u.name === 'Danish'));
  });

  it('GET /sites/:address returns valid seeded site', async () => {
    const res = await fetch(`${baseUrl}/sites/tidepool.zz`);
    assert.strictEqual(res.status, 200);
    const site = (await res.json()) as { address: string; title: string };
    assert.strictEqual(site.address, 'tidepool.zz');
    assert.ok(site.title.includes('Tidepool'));
  });

  it('GET /sites/:address returns 404 Nowhere for non-existent site', async () => {
    const res = await fetch(`${baseUrl}/sites/atlantis.zz`);
    assert.strictEqual(res.status, 404);
    const err = (await res.json()) as { error: string; address: string };
    assert.strictEqual(err.error, 'Nowhere');
    assert.strictEqual(err.address, 'atlantis.zz');
  });

  it('GET /sites/search?q=query performs full-text search across titles and bodies', async () => {
    const res = await fetch(`${baseUrl}/sites/search?q=exoplanet`);
    assert.strictEqual(res.status, 200);
    const results = (await res.json()) as Array<{
      address: string;
      snippet: string;
    }>;
    assert.ok(results.length >= 1);
    assert.strictEqual(results[0].address, 'observatory.zz');
  });

  it('POST /sites publishes a new site and rejects duplicate addresses', async () => {
    const createRes = await fetch(`${baseUrl}/sites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address: 'coral-garden.zz',
        title: 'Coral Garden Sanctuary',
        body: '<h1>Welcome to Coral Garden</h1><p>Reef restoration log.</p>',
        author: 'Danish',
      }),
    });
    assert.strictEqual(createRes.status, 201);

    const dupRes = await fetch(`${baseUrl}/sites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address: 'coral-garden.zz',
        title: 'Duplicate Site',
        body: '<p>Should fail</p>',
        author: 'Elena',
      }),
    });
    assert.strictEqual(dupRes.status, 409);
  });

  it('POST /history and GET /history?user=username record and retrieve visits', async () => {
    const postRes = await fetch(`${baseUrl}/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'Danish',
        address: 'lantern.zz',
        navigationType: 'typed',
      }),
    });
    assert.strictEqual(postRes.status, 201);

    const getRes = await fetch(`${baseUrl}/history?user=Danish`);
    assert.strictEqual(getRes.status, 200);
    const visits = (await getRes.json()) as Array<{
      userId: string;
      address: string;
    }>;
    assert.ok(visits.length >= 13);
    assert.strictEqual(visits[0].address, 'lantern.zz');
  });
});
