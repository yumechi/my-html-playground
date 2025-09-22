const { test, expect } = require('@playwright/test');

test.describe('Storage Sample Page', () => {
  test.beforeEach(async ({ page, context }) => {
    // 各テスト前にストレージをクリア
    await context.clearCookies();
    await page.goto('/storage-sample.html');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('ページが正しく読み込まれる', async ({ page }) => {
    await expect(page).toHaveTitle('Web Storage サンプル - Local Storage & Session Storage');
    await expect(page.locator('h1')).toHaveText('Web Storage サンプルアプリケーション');
  });

  test('Local Storageセクションが表示される', async ({ page }) => {
    await expect(page.locator('h2').filter({ hasText: 'Local Storage（永続的なストレージ）' })).toBeVisible();
    await expect(page.locator('#localKey')).toBeVisible();
    await expect(page.locator('#localValue')).toBeVisible();
    await expect(page.locator('button').filter({ hasText: '保存' }).first()).toBeVisible();
    await expect(page.locator('button').filter({ hasText: '取得' }).first()).toBeVisible();
    await expect(page.locator('button').filter({ hasText: '削除' }).first()).toBeVisible();
    await expect(page.locator('button').filter({ hasText: '全削除' }).first()).toBeVisible();
  });

  test('Session Storageセクションが表示される', async ({ page }) => {
    await expect(page.locator('h2').filter({ hasText: 'Session Storage（セッション限定ストレージ）' })).toBeVisible();
    await expect(page.locator('#sessionKey')).toBeVisible();
    await expect(page.locator('#sessionValue')).toBeVisible();
    await expect(page.locator('button').filter({ hasText: '保存' }).nth(1)).toBeVisible();
    await expect(page.locator('button').filter({ hasText: '取得' }).nth(1)).toBeVisible();
    await expect(page.locator('button').filter({ hasText: '削除' }).nth(1)).toBeVisible();
    await expect(page.locator('button').filter({ hasText: '全削除' }).nth(1)).toBeVisible();
  });

  test('JSONデータセクションが表示される', async ({ page }) => {
    await expect(page.locator('h2').filter({ hasText: 'JSONデータの保存・取得' })).toBeVisible();
    await expect(page.locator('#userName')).toBeVisible();
    await expect(page.locator('#userAge')).toBeVisible();
    await expect(page.locator('#userJob')).toBeVisible();
    await expect(page.locator('#storageType')).toBeVisible();
  });

  test('ストレージ情報セクションが表示される', async ({ page }) => {
    await expect(page.locator('h2').filter({ hasText: 'ストレージ情報' })).toBeVisible();
    await expect(page.locator('button').filter({ hasText: 'ストレージ情報取得' })).toBeVisible();
  });

  test('Local Storageでデータの保存・取得・削除ができる', async ({ page }) => {
    // データ保存
    await page.fill('#localKey', 'testKey');
    await page.fill('#localValue', 'testValue');
    await page.click('button[onclick="setLocalStorage()"]');
    
    // 成功メッセージの確認
    await expect(page.locator('#status')).toHaveText('Local Storageに保存しました');
    await expect(page.locator('#status')).toHaveClass(/success/);
    
    // フォームがクリアされることを確認
    await expect(page.locator('#localKey')).toHaveValue('');
    await expect(page.locator('#localValue')).toHaveValue('');
    
    // データがリストに表示されることを確認
    await expect(page.locator('#localStorageList')).toContainText('testKey: testValue');
    
    // データ取得
    await page.fill('#localKey', 'testKey');
    await page.click('button[onclick="getLocalStorage()"]');
    await expect(page.locator('#localValue')).toHaveValue('testValue');
    
    // データ削除
    await page.click('button[onclick="removeLocalStorage()"]');
    await expect(page.locator('#status')).toHaveText('アイテムを削除しました');
    await expect(page.locator('#localStorageList')).toContainText('データがありません');
  });

  test('Session Storageでデータの保存・取得・削除ができる', async ({ page }) => {
    // データ保存
    await page.fill('#sessionKey', 'sessionTestKey');
    await page.fill('#sessionValue', 'sessionTestValue');
    await page.click('button[onclick="setSessionStorage()"]');
    
    // 成功メッセージの確認
    await expect(page.locator('#status')).toHaveText('Session Storageに保存しました');
    await expect(page.locator('#status')).toHaveClass(/success/);
    
    // データがリストに表示されることを確認
    await expect(page.locator('#sessionStorageList')).toContainText('sessionTestKey: sessionTestValue');
    
    // データ取得
    await page.fill('#sessionKey', 'sessionTestKey');
    await page.click('button[onclick="getSessionStorage()"]');
    await expect(page.locator('#sessionValue')).toHaveValue('sessionTestValue');
    
    // データ削除
    await page.click('button[onclick="removeSessionStorage()"]');
    await expect(page.locator('#status')).toHaveText('アイテムを削除しました');
    await expect(page.locator('#sessionStorageList')).toContainText('データがありません');
  });

  test('JSONユーザーデータの保存・読み込み・削除ができる', async ({ page }) => {
    // ユーザーデータ入力
    await page.fill('#userName', '田中太郎');
    await page.fill('#userAge', '30');
    await page.fill('#userJob', 'エンジニア');
    await page.selectOption('#storageType', 'local');
    
    // データ保存
    await page.click('button[onclick="saveUserData()"]');
    await expect(page.locator('#status')).toHaveText('ユーザーデータをLocal Storageに保存しました');
    
    // フォームがクリアされることを確認
    await expect(page.locator('#userName')).toHaveValue('');
    await expect(page.locator('#userAge')).toHaveValue('');
    await expect(page.locator('#userJob')).toHaveValue('');
    
    // ユーザーデータ表示エリアに保存されたデータが表示されることを確認
    const userDataDisplay = page.locator('#userDataDisplay');
    await expect(userDataDisplay).toContainText('Local Storage のユーザーデータ:');
    await expect(userDataDisplay).toContainText('名前: 田中太郎');
    await expect(userDataDisplay).toContainText('年齢: 30');
    await expect(userDataDisplay).toContainText('職業: エンジニア');
    
    // データ読み込み
    await page.click('button[onclick="loadUserData()"]');
    await expect(page.locator('#userName')).toHaveValue('田中太郎');
    await expect(page.locator('#userAge')).toHaveValue('30');
    await expect(page.locator('#userJob')).toHaveValue('エンジニア');
    
    // データ削除
    await page.click('button[onclick="clearUserData()"]');
    await expect(page.locator('#status')).toHaveText('ユーザーデータを削除しました');
    await expect(page.locator('#userDataDisplay')).toContainText('ユーザーデータがありません');
  });

  test('Session StorageでJSONユーザーデータを保存できる', async ({ page }) => {
    // Session Storageを選択してユーザーデータ保存
    await page.fill('#userName', '佐藤花子');
    await page.fill('#userAge', '25');
    await page.fill('#userJob', 'デザイナー');
    await page.selectOption('#storageType', 'session');
    
    await page.click('button[onclick="saveUserData()"]');
    await expect(page.locator('#status')).toHaveText('ユーザーデータをSession Storageに保存しました');
    
    // Session Storage側に表示されることを確認
    const userDataDisplay = page.locator('#userDataDisplay');
    await expect(userDataDisplay).toContainText('Session Storage のユーザーデータ:');
    await expect(userDataDisplay).toContainText('名前: 佐藤花子');
  });

  test('エラーハンドリング: 空の値での操作', async ({ page }) => {
    // Local Storage: 空のキーで保存を試行
    await page.click('button[onclick="setLocalStorage()"]');
    await expect(page.locator('#status')).toHaveText('キーと値を入力してください');
    await expect(page.locator('#status')).toHaveClass(/error/);
    
    // Local Storage: 空のキーで取得を試行
    await page.click('button[onclick="getLocalStorage()"]');
    await expect(page.locator('#status')).toHaveText('キーを入力してください');
    
    // Session Storage: 空の値での操作
    await page.click('button[onclick="setSessionStorage()"]');
    await expect(page.locator('#status')).toHaveText('キーと値を入力してください');
    
    // JSONデータ: 不完全な入力
    await page.fill('#userName', '名前のみ');
    await page.click('button[onclick="saveUserData()"]');
    await expect(page.locator('#status')).toHaveText('すべての項目を入力してください');
  });

  test('存在しないキーの取得', async ({ page }) => {
    await page.fill('#localKey', 'nonExistentKey');
    await page.click('button[onclick="getLocalStorage()"]');
    await expect(page.locator('#status')).toHaveText('指定されたキーは存在しません');
    await expect(page.locator('#status')).toHaveClass(/error/);
  });

  test('ストレージ情報の表示', async ({ page }) => {
    // テストデータを追加
    await page.fill('#localKey', 'testKey');
    await page.fill('#localValue', 'testValue');
    await page.click('button[onclick="setLocalStorage()"]');
    
    await page.fill('#sessionKey', 'sessionKey');
    await page.fill('#sessionValue', 'sessionValue');
    await page.click('button[onclick="setSessionStorage()"]');
    
    // ストレージ情報取得
    await page.click('button[onclick="showStorageInfo()"]');
    
    const storageInfo = page.locator('#storageInfo');
    await expect(storageInfo).toContainText('Local Storage:');
    await expect(storageInfo).toContainText('アイテム数: 1');
    await expect(storageInfo).toContainText('Session Storage:');
    await expect(storageInfo).toContainText('アイテム数: 1');
    await expect(storageInfo).toContainText('ブラウザサポート:');
    await expect(storageInfo).toContainText('Local Storage: 対応');
    await expect(storageInfo).toContainText('Session Storage: 対応');
  });

  test('全削除機能の確認', async ({ page }) => {
    // テストデータ追加
    await page.fill('#localKey', 'key1');
    await page.fill('#localValue', 'value1');
    await page.click('button[onclick="setLocalStorage()"]');
    
    await page.fill('#localKey', 'key2');
    await page.fill('#localValue', 'value2');
    await page.click('button[onclick="setLocalStorage()"]');
    
    // データが存在することを確認
    await expect(page.locator('#localStorageList')).toContainText('key1: value1');
    await expect(page.locator('#localStorageList')).toContainText('key2: value2');
    
    // 全削除実行（確認ダイアログを受け入れ）
    page.on('dialog', dialog => dialog.accept());
    await page.click('button[onclick="clearLocalStorage()"]');
    
    await expect(page.locator('#status')).toHaveText('Local Storageをクリアしました');
    await expect(page.locator('#localStorageList')).toContainText('データがありません');
  });

  test('ページ読み込み時の初期化', async ({ page }) => {
    // 事前にデータを保存
    await page.evaluate(() => {
      localStorage.setItem('preloadedKey', 'preloadedValue');
      sessionStorage.setItem('preloadedSessionKey', 'preloadedSessionValue');
      const userData = { name: '事前ユーザー', age: 99, job: 'テスター', savedAt: new Date().toLocaleString('ja-JP') };
      localStorage.setItem('userData', JSON.stringify(userData));
    });
    
    // ページリロード
    await page.reload();
    
    // 保存されたデータが表示されることを確認
    await expect(page.locator('#localStorageList')).toContainText('preloadedKey: preloadedValue');
    await expect(page.locator('#sessionStorageList')).toContainText('preloadedSessionKey: preloadedSessionValue');
    await expect(page.locator('#userDataDisplay')).toContainText('事前ユーザー');
  });

  test('複数データの管理', async ({ page }) => {
    // 複数のLocal Storageデータを追加
    const testData = [
      { key: 'user1', value: 'データ1' },
      { key: 'user2', value: 'データ2' },
      { key: 'user3', value: 'データ3' }
    ];
    
    for (const data of testData) {
      await page.fill('#localKey', data.key);
      await page.fill('#localValue', data.value);
      await page.click('button[onclick="setLocalStorage()"]');
    }
    
    // すべてのデータが表示されることを確認
    for (const data of testData) {
      await expect(page.locator('#localStorageList')).toContainText(`${data.key}: ${data.value}`);
    }
    
    // 特定のデータを削除
    await page.fill('#localKey', 'user2');
    await page.click('button[onclick="removeLocalStorage()"]');
    
    // 削除されたデータは表示されず、他のデータは残ることを確認
    await expect(page.locator('#localStorageList')).not.toContainText('user2: データ2');
    await expect(page.locator('#localStorageList')).toContainText('user1: データ1');
    await expect(page.locator('#localStorageList')).toContainText('user3: データ3');
  });

  test('ステータスメッセージの自動消去', async ({ page }) => {
    await page.fill('#localKey', 'testKey');
    await page.fill('#localValue', 'testValue');
    await page.click('button[onclick="setLocalStorage()"]');
    
    // メッセージが表示されることを確認
    await expect(page.locator('#status')).toHaveText('Local Storageに保存しました');
    await expect(page.locator('#status')).toHaveClass(/success/);
    
    // 3秒後にメッセージが消えることを確認
    await page.waitForTimeout(3100);
    await expect(page.locator('#status')).toHaveText('');
    await expect(page.locator('#status')).not.toHaveClass(/success/);
  });
});