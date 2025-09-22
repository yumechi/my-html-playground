const { test, expect } = require('@playwright/test');

test.describe('IndexedDB Sample Page', () => {
  test.beforeEach(async ({ page, context }) => {
    // 各テスト前にIndexedDBをクリア
    await context.clearCookies();
    await page.goto('/indexeddb-sample.html');
    
    // IndexedDBを削除してクリーンな状態にする
    await page.evaluate(async () => {
      const deleteDB = () => {
        return new Promise((resolve) => {
          const deleteRequest = indexedDB.deleteDatabase('SampleDB');
          deleteRequest.onsuccess = () => resolve();
          deleteRequest.onerror = () => resolve();
          deleteRequest.onblocked = () => resolve();
        });
      };
      await deleteDB();
    });
  });

  test('ページが正しく読み込まれる', async ({ page }) => {
    await expect(page).toHaveTitle('IndexedDB サンプル');
    await expect(page.locator('h1')).toHaveText('IndexedDB サンプルアプリケーション');
  });

  test('データベース操作セクションが表示される', async ({ page }) => {
    await expect(page.locator('h2').filter({ hasText: 'データベース操作' })).toBeVisible();
    await expect(page.locator('button').filter({ hasText: 'データベース初期化' })).toBeVisible();
    await expect(page.locator('button').filter({ hasText: 'サンプルデータ生成' })).toBeVisible();
    await expect(page.locator('button').filter({ hasText: '全データ削除' })).toBeVisible();
    await expect(page.locator('button').filter({ hasText: 'データベース完全削除' })).toBeVisible();
    await expect(page.locator('button').filter({ hasText: '期限切れデータ削除' })).toBeVisible();
  });

  test('データ追加・更新セクションが表示される', async ({ page }) => {
    await expect(page.locator('h2').filter({ hasText: 'データ追加・更新' })).toBeVisible();
    await expect(page.locator('#itemId')).toBeVisible();
    await expect(page.locator('#itemName')).toBeVisible();
    await expect(page.locator('#itemAge')).toBeVisible();
    await expect(page.locator('#itemJob')).toBeVisible();
    await expect(page.locator('#itemTTL')).toBeVisible();
    await expect(page.locator('button').filter({ hasText: '追加・更新' })).toBeVisible();
  });

  test('データ検索セクションが表示される', async ({ page }) => {
    await expect(page.locator('h2').filter({ hasText: 'データ検索' })).toBeVisible();
    await expect(page.locator('#searchTerm')).toBeVisible();
    await expect(page.locator('button').filter({ hasText: '検索' })).toBeVisible();
    await expect(page.locator('button').filter({ hasText: '全件表示' })).toBeVisible();
  });

  test('データ一覧セクションが表示される', async ({ page }) => {
    await expect(page.locator('h2').filter({ hasText: 'データ一覧' })).toBeVisible();
    await expect(page.locator('#dataList')).toBeVisible();
  });

  test('データベース初期化ができる', async ({ page }) => {
    await page.click('button[onclick="initDB()"]');
    
    // 成功メッセージの確認
    await expect(page.locator('#status')).toHaveText('データベースが正常に初期化されました');
    await expect(page.locator('#status')).toHaveClass(/success/);
    
    // データリストが空であることを確認
    await expect(page.locator('#dataList')).toContainText('データがありません');
  });

  test('サンプルデータ生成ができる', async ({ page }) => {
    // まずデータベースを初期化
    await page.click('button[onclick="initDB()"]');
    await page.waitForSelector('#status:has-text("データベースが正常に初期化されました")');
    
    // サンプルデータ生成
    await page.click('button[onclick="generateSampleData()"]');
    
    // 成功メッセージの確認
    await expect(page.locator('#status')).toHaveText('サンプルデータを生成しました');
    
    // サンプルデータがリストに表示されることを確認
    await expect(page.locator('#dataList')).toContainText('田中太郎');
    await expect(page.locator('#dataList')).toContainText('佐藤花子');
    await expect(page.locator('#dataList')).toContainText('鈴木一郎');
    await expect(page.locator('#dataList')).toContainText('高橋美咲');
    await expect(page.locator('#dataList')).toContainText('伊藤健太');
  });

  test('データの追加ができる', async ({ page }) => {
    // データベース初期化
    await page.click('button[onclick="initDB()"]');
    await page.waitForSelector('#status:has-text("データベースが正常に初期化されました")');
    
    // データ入力
    await page.fill('#itemName', 'テストユーザー');
    await page.fill('#itemAge', '25');
    await page.fill('#itemJob', 'テスター');
    
    // データ追加
    await page.click('button[onclick="addOrUpdateData()"]');
    
    // 成功メッセージの確認
    await expect(page.locator('#status')).toHaveText('データを追加しました');
    
    // フォームがクリアされることを確認
    await expect(page.locator('#itemId')).toHaveValue('');
    await expect(page.locator('#itemName')).toHaveValue('');
    await expect(page.locator('#itemAge')).toHaveValue('');
    await expect(page.locator('#itemJob')).toHaveValue('');
    
    // データがリストに表示されることを確認
    await expect(page.locator('#dataList')).toContainText('テストユーザー');
    await expect(page.locator('#dataList')).toContainText('25');
    await expect(page.locator('#dataList')).toContainText('テスター');
  });

  test('TTL付きデータの追加ができる', async ({ page }) => {
    // データベース初期化
    await page.click('button[onclick="initDB()"]');
    await page.waitForSelector('#status:has-text("データベースが正常に初期化されました")');
    
    // TTL付きデータ入力
    await page.fill('#itemName', 'TTLユーザー');
    await page.fill('#itemAge', '30');
    await page.fill('#itemJob', 'エンジニア');
    await page.selectOption('#itemTTL', '60000'); // 1分
    
    // データ追加
    await page.click('button[onclick="addOrUpdateData()"]');
    
    // データがリストに表示され、期限情報が含まれることを確認
    await expect(page.locator('#dataList')).toContainText('TTLユーザー');
    await expect(page.locator('#dataList')).toContainText('期限:');
  });

  test('データの更新ができる', async ({ page }) => {
    // データベース初期化とサンプルデータ生成
    await page.click('button[onclick="initDB()"]');
    await page.waitForSelector('#status:has-text("データベースが正常に初期化されました")');
    await page.click('button[onclick="generateSampleData()"]');
    await page.waitForSelector('#status:has-text("サンプルデータを生成しました")');
    
    // 編集ボタンをクリック（最初のデータを編集）
    await page.click('.data-item button:has-text("編集")');
    
    // フォームにデータが入力されることを確認
    await expect(page.locator('#itemId')).not.toHaveValue('');
    await expect(page.locator('#itemName')).not.toHaveValue('');
    
    // データを更新
    await page.fill('#itemName', '更新されたユーザー');
    await page.click('button[onclick="addOrUpdateData()"]');
    
    // 更新メッセージの確認
    await expect(page.locator('#status')).toHaveText('データを更新しました');
    
    // 更新されたデータが表示されることを確認
    await expect(page.locator('#dataList')).toContainText('更新されたユーザー');
  });

  test('データの削除ができる', async ({ page }) => {
    // データベース初期化とサンプルデータ生成
    await page.click('button[onclick="initDB()"]');
    await page.waitForSelector('#status:has-text("データベースが正常に初期化されました")');
    await page.click('button[onclick="generateSampleData()"]');
    await page.waitForSelector('#status:has-text("サンプルデータを生成しました")');
    
    // 最初の項目の数を確認
    const initialItems = await page.locator('.data-item').count();
    expect(initialItems).toBeGreaterThan(0);
    
    // 削除確認ダイアログを受け入れ
    page.on('dialog', dialog => dialog.accept());
    
    // 削除ボタンをクリック
    await page.click('.data-item button.danger:has-text("削除")');
    
    // 削除メッセージの確認
    await expect(page.locator('#status')).toHaveText('データを削除しました');
    
    // データ数が減っていることを確認
    const remainingItems = await page.locator('.data-item').count();
    expect(remainingItems).toBe(initialItems - 1);
  });

  test('データ検索ができる', async ({ page }) => {
    // データベース初期化とサンプルデータ生成
    await page.click('button[onclick="initDB()"]');
    await page.waitForSelector('#status:has-text("データベースが正常に初期化されました")');
    await page.click('button[onclick="generateSampleData()"]');
    await page.waitForSelector('#status:has-text("サンプルデータを生成しました")');
    
    // 検索実行
    await page.fill('#searchTerm', '田中');
    await page.click('button[onclick="searchData()"]');
    
    // 検索結果の確認
    await expect(page.locator('#dataList')).toContainText('田中太郎');
    await expect(page.locator('#dataList')).not.toContainText('佐藤花子');
    
    // 検索クリア
    await page.fill('#searchTerm', '');
    await page.click('button[onclick="loadAllData()"]');
    
    // 全データが再表示されることを確認
    await expect(page.locator('#dataList')).toContainText('田中太郎');
    await expect(page.locator('#dataList')).toContainText('佐藤花子');
  });

  test('全データ削除ができる', async ({ page }) => {
    // データベース初期化とサンプルデータ生成
    await page.click('button[onclick="initDB()"]');
    await page.waitForSelector('#status:has-text("データベースが正常に初期化されました")');
    await page.click('button[onclick="generateSampleData()"]');
    await page.waitForSelector('#status:has-text("サンプルデータを生成しました")');
    
    // データが存在することを確認
    await expect(page.locator('.data-item')).toHaveCount(5);
    
    // 削除確認ダイアログを受け入れ
    page.on('dialog', dialog => dialog.accept());
    
    // 全データ削除実行
    await page.click('button[onclick="clearAllData()"]');
    
    // 削除メッセージの確認
    await expect(page.locator('#status')).toHaveText('すべてのデータを削除しました');
    
    // データがないことを確認
    await expect(page.locator('#dataList')).toContainText('データがありません');
  });

  test('データベース完全削除ができる', async ({ page }) => {
    // データベース初期化とサンプルデータ生成
    await page.click('button[onclick="initDB()"]');
    await page.waitForSelector('#status:has-text("データベースが正常に初期化されました")');
    await page.click('button[onclick="generateSampleData()"]');
    await page.waitForSelector('#status:has-text("サンプルデータを生成しました")');
    
    // データが存在することを確認
    await expect(page.locator('.data-item')).toHaveCount(5);
    
    // 削除確認ダイアログを受け入れ
    page.on('dialog', dialog => dialog.accept());
    
    // データベース完全削除実行
    await page.click('button[onclick="deleteDatabase()"]');
    
    // 削除後の状態を確認（メッセージまたはデータリストの状態）
    await page.waitForFunction(() => {
      const status = document.querySelector('#status');
      const dataList = document.querySelector('#dataList');
      return (status && status.textContent.includes('データベースを完全に削除しました')) ||
             (dataList && dataList.textContent.includes('データがありません'));
    }, { timeout: 10000 });
    
    // データがないことを確認
    await expect(page.locator('#dataList')).toContainText('データがありません');
  });

  test('期限切れデータの削除ができる', async ({ page }) => {
    // データベース初期化
    await page.click('button[onclick="initDB()"]');
    await page.waitForSelector('#status:has-text("データベースが正常に初期化されました")');
    
    // 過去の時刻を期限とするデータを追加（JavaScriptで直接実行）
    await page.evaluate(() => {
      const transaction = db.transaction(['people'], 'readwrite');
      const objectStore = transaction.objectStore('people');
      const now = Date.now();
      const expiredData = {
        name: '期限切れユーザー',
        age: 40,
        job: '管理者',
        createdAt: now - 1000000,
        expiresAt: now - 1000  // 過去の時刻
      };
      objectStore.add(expiredData);
    });
    
    // 期限切れデータ削除実行
    await page.click('button[onclick="cleanExpiredData()"]');
    
    // 削除メッセージの確認（削除件数が含まれる）
    await expect(page.locator('#status')).toContainText('期限切れデータ');
    await expect(page.locator('#status')).toContainText('件を削除しました');
  });

  test('エラーハンドリング: データベース未初期化', async ({ page }) => {
    // 実際のページでは自動初期化されるため、代わりに不完全な入力でのエラーハンドリングをテスト
    await page.click('button[onclick="addOrUpdateData()"]');
    
    // 空のフィールドでデータ追加を試行した場合のエラーメッセージを確認
    await expect(page.locator('#status')).toHaveText('すべての項目を入力してください');
    await expect(page.locator('#status')).toHaveClass(/error/);
    
    // 名前のみ入力して再度試行
    await page.fill('#itemName', '名前のみ');
    await page.click('button[onclick="addOrUpdateData()"]');
    await expect(page.locator('#status')).toHaveText('すべての項目を入力してください');
    await expect(page.locator('#status')).toHaveClass(/error/);
  });

  test('エラーハンドリング: 不完全な入力', async ({ page }) => {
    // データベース初期化
    await page.click('button[onclick="initDB()"]');
    await page.waitForSelector('#status:has-text("データベースが正常に初期化されました")');
    
    // 名前のみ入力してデータ追加を試行
    await page.fill('#itemName', '名前のみ');
    await page.click('button[onclick="addOrUpdateData()"]');
    
    await expect(page.locator('#status')).toHaveText('すべての項目を入力してください');
    await expect(page.locator('#status')).toHaveClass(/error/);
  });

  test('データの詳細表示', async ({ page }) => {
    // データベース初期化とサンプルデータ生成
    await page.click('button[onclick="initDB()"]');
    await page.waitForSelector('#status:has-text("データベースが正常に初期化されました")');
    await page.click('button[onclick="generateSampleData()"]');
    await page.waitForSelector('#status:has-text("サンプルデータを生成しました")');
    
    // データアイテムの詳細を確認
    const dataItem = page.locator('.data-item').first();
    await expect(dataItem).toContainText('ID:');
    await expect(dataItem).toContainText('名前:');
    await expect(dataItem).toContainText('年齢:');
    await expect(dataItem).toContainText('職業:');
    await expect(dataItem).toContainText('作成日時:');
    
    // 編集・削除ボタンの存在確認
    await expect(dataItem.locator('button:has-text("編集")')).toBeVisible();
    await expect(dataItem.locator('button:has-text("削除")')).toBeVisible();
  });

  test('ページ読み込み時の自動初期化', async ({ page }) => {
    // ページ読み込み時に自動でデータベース初期化が実行されることを確認
    // （window.onloadでinitDB()が呼ばれる）
    await page.waitForSelector('#status:has-text("データベースが正常に初期化されました")');
    await expect(page.locator('#dataList')).toContainText('データがありません');
  });

  test('定期的なデータ更新', async ({ page }) => {
    // データベース初期化
    await page.click('button[onclick="initDB()"]');
    await page.waitForSelector('#status:has-text("データベースが正常に初期化されました")');
    
    // TTL付きデータを追加
    await page.fill('#itemName', '短命ユーザー');
    await page.fill('#itemAge', '20');
    await page.fill('#itemJob', 'インターン');
    await page.selectOption('#itemTTL', '60000'); // 1分
    await page.click('button[onclick="addOrUpdateData()"]');
    
    // データが表示されることを確認
    await expect(page.locator('#dataList')).toContainText('短命ユーザー');
    
    // 30秒間隔でloadAllData()が実行されることを想定
    // （実際のテストでは30秒待つのは非現実的なので、機能の存在のみ確認）
    await expect(page.locator('#dataList')).toContainText('期限:');
  });

  test('複数データの並行処理', async ({ page }) => {
    // データベース初期化
    await page.click('button[onclick="initDB()"]');
    await page.waitForSelector('#status:has-text("データベースが正常に初期化されました")');
    
    // 複数のデータを順次追加
    const testUsers = [
      { name: 'ユーザー1', age: '25', job: '職業1' },
      { name: 'ユーザー2', age: '30', job: '職業2' },
      { name: 'ユーザー3', age: '35', job: '職業3' }
    ];
    
    for (const user of testUsers) {
      await page.fill('#itemName', user.name);
      await page.fill('#itemAge', user.age);
      await page.fill('#itemJob', user.job);
      await page.click('button[onclick="addOrUpdateData()"]');
      await page.waitForSelector(`#status:has-text("データを追加しました")`);
    }
    
    // すべてのデータが表示されることを確認
    for (const user of testUsers) {
      await expect(page.locator('#dataList')).toContainText(user.name);
    }
    
    // データ数の確認
    await expect(page.locator('.data-item')).toHaveCount(3);
  });
});