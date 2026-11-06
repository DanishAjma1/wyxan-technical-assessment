import { describe, it, before, after } from 'node:test';
import * as assert from 'node:assert';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './app.module';

describe('Wyxan Mini Browser — Full Assessment Specification Suite', () => {
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

  it('Section 04 (Data): Seeded people exist and multiple authors have >1 site to their name', async () => {
    const usersRes = await fetch(`${baseUrl}/users`);
    assert.strictEqual(usersRes.status, 200);
    const users = (await usersRes.json()) as Array<{ name: string }>;
    assert.strictEqual(users.length, 4);

    const sitesRes = await fetch(`${baseUrl}/sites`);
    assert.strictEqual(sitesRes.status, 200);
    const sites = (await sitesRes.json()) as Array<{
      address: string;
      title: string;
      body: string;
      author: string;
    }>;
    assert.strictEqual(sites.length, 10);

    // Count sites per author
    const countsByAuthor: Record<string, number> = {};
    for (const s of sites) {
      countsByAuthor[s.author] = (countsByAuthor[s.author] || 0) + 1;
    }
    const multiSiteAuthors = Object.values(countsByAuthor).filter((c) => c > 1);
    assert.ok(
      multiSiteAuthors.length >= 2,
      'At least two authors must have more than one site',
    );
  });

  it('Section 04 (Data): Seeded sites link to each other and include dead links to Nowhere', async () => {
    const sitesRes = await fetch(`${baseUrl}/sites`);
    const sites = (await sitesRes.json()) as Array<{
      address: string;
      body: string;
    }>;
    const validAddresses = new Set(sites.map((s) => s.address));

    let validInternalLinksCount = 0;
    let deadLinksCount = 0;

    for (const site of sites) {
      const hrefMatches = [...site.body.matchAll(/href=["']([^#"']+)["']/gi)];
      for (const match of hrefMatches) {
        const target = match[1].toLowerCase().trim();
        if (validAddresses.has(target)) {
          validInternalLinksCount++;
        } else {
          deadLinksCount++;
        }
      }
    }

    assert.ok(validInternalLinksCount >= 15, 'Sites must richly interconnect');
    assert.ok(
      deadLinksCount >= 4,
      'Sites must include links to non-existent addresses',
    );
  });

  it('Section 04 (Data): 1 hour of browsing history with repeat visits, long trail, and one user visiting all 10 sites', async () => {
    const res = await fetch(`${baseUrl}/history?user=Danish`);
    assert.strictEqual(res.status, 200);
    const visits = (await res.json()) as Array<{
      userId: string;
      address: string;
      timestamp: string;
      navigationType: string;
    }>;

    assert.ok(visits.length >= 15, 'Danish should have a long browsing trail');
    const uniqueVisited = new Set(visits.map((v) => v.address));
    assert.ok(
      uniqueVisited.size >= 10,
      'Danish should have visited all 10 seeded sites',
    );

    // Check repeat visits exist (total visits > unique addresses)
    assert.ok(
      visits.length > uniqueVisited.size,
      'History must contain repeat visits',
    );

    // Verify 60-minute (1 hour) span
    const timestamps = visits.map((v) => new Date(v.timestamp).getTime());
    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);
    assert.strictEqual(
      maxTime - minTime,
      60 * 60 * 1000,
      'Initial seeded history spans exactly 1 hour',
    );
  });

  it('Section 01 & 03 (Browse & Nowhere): Valid addresses resolve and non-existent addresses return 404 Nowhere', async () => {
    const okRes = await fetch(`${baseUrl}/sites/tidepool.zz`);
    assert.strictEqual(okRes.status, 200);
    const site = (await okRes.json()) as { address: string; title: string };
    assert.strictEqual(site.address, 'tidepool.zz');

    // Broken link address with .zz
    const nowhereRes1 = await fetch(`${baseUrl}/sites/atlantis.zz`);
    assert.strictEqual(nowhereRes1.status, 404);
    const err1 = (await nowhereRes1.json()) as { error: string; address: string };
    assert.strictEqual(err1.error, 'Nowhere');
    assert.strictEqual(err1.address, 'atlantis.zz');

    // Arbitrary address without .zz
    const nowhereRes2 = await fetch(`${baseUrl}/sites/uncharted-island`);
    assert.strictEqual(nowhereRes2.status, 404);
    const err2 = (await nowhereRes2.json()) as { error: string; address: string };
    assert.strictEqual(err2.error, 'Nowhere');
    assert.strictEqual(err2.address, 'uncharted-island');
  });

  it('Section 01 & 03 (Search): Finds pages by body prose content, not just titles', async () => {
    // "Schistostega" only appears inside botanica.zz's body prose, not its title
    const res1 = await fetch(`${baseUrl}/sites/search?q=Schistostega`);
    assert.strictEqual(res1.status, 200);
    const matches1 = (await res1.json()) as Array<{
      address: string;
      snippet: string;
    }>;
    assert.strictEqual(matches1.length, 1);
    assert.strictEqual(matches1[0].address, 'botanica.zz');
    assert.ok(matches1[0].snippet.toLowerCase().includes('schistostega'));

    // "TRAPPIST-1e" only appears inside observatory.zz's body table, not its title
    const res2 = await fetch(`${baseUrl}/sites/search?q=TRAPPIST-1e`);
    assert.strictEqual(res2.status, 200);
    const matches2 = (await res2.json()) as Array<{ address: string }>;
    assert.strictEqual(matches2.length, 1);
    assert.strictEqual(matches2[0].address, 'observatory.zz');
  });

  it('Section 01 & 03 (Publish): Publishing a new site makes it immediately browsable and searchable', async () => {
    const createRes = await fetch(`${baseUrl}/sites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address: 'coral-garden.zz',
        title: 'Coral Garden Sanctuary',
        body: '<h1>Welcome to Coral Garden</h1><p>Unique bioluminescent staghorn reef restoration log.</p>',
        author: 'Danish',
      }),
    });
    assert.strictEqual(createRes.status, 201);

    // Immediately browsable
    const getRes = await fetch(`${baseUrl}/sites/coral-garden.zz`);
    assert.strictEqual(getRes.status, 200);

    // Immediately searchable by body content ("staghorn")
    const searchRes = await fetch(`${baseUrl}/sites/search?q=staghorn`);
    assert.strictEqual(searchRes.status, 200);
    const searchMatches = (await searchRes.json()) as Array<{ address: string }>;
    assert.ok(searchMatches.some((m) => m.address === 'coral-garden.zz'));

    // Rejects duplicate registration of the same address
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

  it('Section 01 & 03 (History & Retrace): Records visits per user and retrieves chronological history', async () => {
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
    assert.strictEqual(visits[0].address, 'lantern.zz');
  });
});
