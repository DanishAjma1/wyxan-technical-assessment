import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('Wyxan Mini Browser — Frontend Assessment Specification Checks', () => {
  const srcDir = path.join(process.cwd(), 'src');

  it('SandboxedViewport contains untrusted HTML in sandbox="allow-scripts" without allow-same-origin', () => {
    const viewportCode = fs.readFileSync(
      path.join(srcDir, 'components/SandboxedViewport.tsx'),
      'utf8',
    );
    assert.ok(
      viewportCode.includes('sandbox="allow-scripts"'),
      'Must use sandbox="allow-scripts"',
    );
    assert.ok(
      !viewportCode.includes('allow-same-origin'),
      'Must NOT include allow-same-origin to prevent XSS parent escape',
    );
    assert.ok(
      viewportCode.includes('MINI_BROWSER_NAVIGATE'),
      'Must intercept internal <a> link clicks via postMessage',
    );
    assert.ok(
      viewportCode.includes('MINI_BROWSER_RESTORE_STATE'),
      'Must support restore-on-return scroll and form state preservation',
    );
  });

  it('MiniBrowser navigation engine supports Back, Forward, forward truncation, and Search return', () => {
    const browserCode = fs.readFileSync(
      path.join(srcDir, 'components/MiniBrowser.tsx'),
      'utf8',
    );
    assert.ok(
      browserCode.includes('userSess.stack.slice(0, userSess.currentIndex + 1)'),
      'Navigating to a new page after going Back must truncate forward stack ("forward can be lost")',
    );
    assert.ok(
      browserCode.includes('handleSelectSearchResult'),
      'Selecting a search result records the search state on the stack so Back returns to search results',
    );
  });

  it('PublishModal allows picking a publisher from the user list and publishing raw HTML', () => {
    const publishCode = fs.readFileSync(
      path.join(srcDir, 'components/PublishModal.tsx'),
      'utf8',
    );
    assert.ok(
      publishCode.includes('publish-author-select'),
      'PublishModal must allow selecting the publisher from the users list',
    );
    assert.ok(
      publishCode.includes('PublishSiteSchema.safeParse'),
      'PublishModal must validate inputs with Zod',
    );
  });
});
