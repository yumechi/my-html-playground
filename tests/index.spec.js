const { test, expect } = require('@playwright/test');

test.describe('Index Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
  });

  test('ページが正しく読み込まれる', async ({ page }) => {
    await expect(page).toHaveTitle('HTML Playground');
    await expect(page.locator('h1')).toHaveText('HTML Playground');
  });

  test('プロジェクト説明が表示される', async ({ page }) => {
    const description = page.locator('p').first();
    await expect(description).toContainText('HTML やブラウザの基礎的な機能を学習するためのサンプル集');
  });

  test('4つのサンプルリンクが表示される', async ({ page }) => {
    await expect(page.locator('.sample-item')).toHaveCount(4);
    
    // IndexedDBサンプルのチェック
    const indexeddbItem = page.locator('.sample-item').filter({ hasText: 'IndexedDB サンプル' });
    await expect(indexeddbItem.locator('.sample-title')).toHaveText('IndexedDB サンプル');
    await expect(indexeddbItem.locator('.sample-description')).toContainText('ブラウザ内蔵のデータベース IndexedDB を使用したCRUD操作のサンプル');
    await expect(indexeddbItem.locator('.features')).toContainText('データベース初期化、サンプルデータ生成、検索機能、個別削除、全件削除');
    await expect(indexeddbItem.locator('.sample-link')).toHaveAttribute('href', 'indexeddb-sample.html');

    // Web Storageサンプルのチェック
    const storageItem = page.locator('.sample-item').filter({ hasText: 'Web Storage サンプル' });
    await expect(storageItem.locator('.sample-title')).toHaveText('Web Storage サンプル');
    await expect(storageItem.locator('.sample-description')).toContainText('Local Storage と Session Storage を使用したデータ保存のサンプル');
    await expect(storageItem.locator('.features')).toContainText('データ保存・取得・削除、JSONデータ処理、ストレージ情報表示、リアルタイム更新');
    await expect(storageItem.locator('.sample-link')).toHaveAttribute('href', 'storage-sample.html');

    // Web Workersサンプルのチェック
    const workersItem = page.locator('.sample-item').filter({ hasText: 'Web Workers サンプル' });
    await expect(workersItem.locator('.sample-title')).toHaveText('Web Workers サンプル');
    await expect(workersItem.locator('.sample-description')).toContainText('メインUIスレッドとは別のバックグラウンドスレッドでJavaScriptを実行するWeb Workersのサンプル');
    await expect(workersItem.locator('.features')).toContainText('基本的なWorker操作、重い計算処理、複数Workerの並列処理、エラーハンドリング');
    await expect(workersItem.locator('.sample-link')).toHaveAttribute('href', 'webworkers-sample.html');

    // Service Workersサンプルのチェック
    const serviceWorkersItem = page.locator('.sample-item').filter({ hasText: 'Service Workers サンプル' });
    await expect(serviceWorkersItem.locator('.sample-title')).toHaveText('Service Workers サンプル');
    await expect(serviceWorkersItem.locator('.sample-description')).toContainText('ウェブアプリケーションとネットワークの間でプロキシとして動作するService Workersのサンプル');
    await expect(serviceWorkersItem.locator('.features')).toContainText('Service Worker登録・管理、キャッシュ操作、ネットワークインターセプト、通知機能');
    await expect(serviceWorkersItem.locator('.sample-link')).toHaveAttribute('href', 'serviceworkers-sample.html');
  });

  test('サンプルリンクがクリック可能', async ({ page }) => {
    const indexeddbLink = page.locator('a[href="indexeddb-sample.html"]');
    await expect(indexeddbLink).toBeVisible();
    await expect(indexeddbLink).toHaveText('サンプルを開く');

    const storageLink = page.locator('a[href="storage-sample.html"]');
    await expect(storageLink).toBeVisible();
    await expect(storageLink).toHaveText('サンプルを開く');

    const workersLink = page.locator('a[href="webworkers-sample.html"]');
    await expect(workersLink).toBeVisible();
    await expect(workersLink).toHaveText('サンプルを開く');

    const serviceWorkersLink = page.locator('a[href="serviceworkers-sample.html"]');
    await expect(serviceWorkersLink).toBeVisible();
    await expect(serviceWorkersLink).toHaveText('サンプルを開く');
  });

  test('フッターが表示される', async ({ page }) => {
    const footer = page.locator('.footer');
    await expect(footer).toBeVisible();
    await expect(footer.locator('p')).toHaveText('このプロジェクトは HTML やブラウザ機能の学習を目的としています');
  });

  test('CSSが適用されている', async ({ page }) => {
    await expect(page.locator('.container')).toBeVisible();
    await expect(page.locator('.sample-list')).toBeVisible();
    await expect(page.locator('.sample-item')).toHaveCount(4);
  });

  test('レスポンシブデザインの確認', async ({ page }) => {
    // デスクトップビュー
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('.container')).toBeVisible();

    // タブレットビュー
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('.container')).toBeVisible();

    // モバイルビュー
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('.container')).toBeVisible();
    await expect(page.locator('.sample-item')).toHaveCount(4);
  });

  test('各サンプルページへのナビゲーション', async ({ page }) => {
    // IndexedDBサンプルページへのナビゲーション
    // IndexedDBサンプルページへのナビゲーション
    await page.click('a[href="indexeddb-sample.html"]');
    await expect(page).toHaveTitle('IndexedDB サンプル');
    await page.goBack();

    // Web Storageサンプルページへのナビゲーション
    await page.click('a[href="storage-sample.html"]');
    await expect(page).toHaveTitle('Web Storage サンプル - Local Storage & Session Storage');
    await page.goBack();

    // Web Workersサンプルページへのナビゲーション
    await page.click('a[href="webworkers-sample.html"]');
    await expect(page).toHaveTitle('Web Workers サンプル');
    await page.goBack();

    // Service Workersサンプルページへのナビゲーション
    await page.click('a[href="serviceworkers-sample.html"]');
    await expect(page).toHaveTitle('Service Workers サンプル');
    await page.goBack();
  });
});