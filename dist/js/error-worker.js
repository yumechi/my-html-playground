// エラーテスト用Workerスクリプト
// 意図的にエラーを発生させてエラーハンドリングをテストする

self.onmessage = function(e) {
    const command = e.data;

    console.log('エラーWorker: コマンドを受信:', command);

    // 正常なメッセージを送信
    self.postMessage('エラーWorkerが開始されました。エラーを発生させます...');

    // 少し待ってからエラーを発生
    setTimeout(() => {
        try {
            switch (command) {
                case 'trigger-error':
                    // 意図的に例外を発生
                    throw new Error('これは意図的に発生させたエラーです');

                case 'reference-error':
                    // 未定義の変数にアクセス
                    console.log(undefinedVariable);
                    break;

                case 'type-error':
                    // 型エラーを発生
                    const nullValue = null;
                    nullValue.someMethod();
                    break;

                case 'range-error':
                    // 範囲エラーを発生
                    const arr = new Array(-1);
                    break;

                case 'syntax-error':
                    // 構文エラーをシミュレート（evalを使用）
                    eval('this is invalid syntax {{{');
                    break;

                case 'infinite-loop':
                    // 無限ループ（Workerがハングする）
                    while (true) {
                        // 何もしない無限ループ
                        Math.random();
                    }
                    break;

                case 'memory-error':
                    // メモリエラーをシミュレート（大量の配列作成）
                    const largeArray = [];
                    for (let i = 0; i < 10000000; i++) {
                        largeArray.push(new Array(1000).fill(i));
                    }
                    break;

                case 'network-error':
                    // ネットワークエラーをシミュレート
                    fetch('https://nonexistent-domain-12345.com/api/data')
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('ネットワークエラーが発生しました');
                            }
                        })
                        .catch(error => {
                            throw new Error(`Fetch failed: ${error.message}`);
                        });
                    break;

                default:
                    // デフォルトエラー
                    throw new Error(`未知のコマンド: ${command}`);
            }
        } catch (error) {
            // キャッチしたエラーを再スロー（onErrorハンドラーでキャッチさせる）
            console.error('エラーWorker内でエラーをキャッチ:', error);
            throw error;
        }
    }, 1000);

    // 追加のエラーパターン
    if (command === 'async-error') {
        // 非同期エラー
        setTimeout(() => {
            throw new Error('非同期エラーが発生しました');
        }, 2000);
    }

    if (command === 'promise-error') {
        // Promise内でのエラー
        new Promise((resolve, reject) => {
            setTimeout(() => {
                reject(new Error('Promise内でエラーが発生しました'));
            }, 1500);
        }).catch(error => {
            throw error;
        });
    }
};

// 意図的にグローバルエラーを発生させる関数
function triggerGlobalError() {
    // グローバルスコープでエラーを発生
    nonExistentFunction();
}

// Worker開始時に条件付きでエラーを発生
if (Math.random() > 0.9) {
    console.log('エラーWorker: ランダムエラーが発生しました（10%の確率）');
    // triggerGlobalError(); // コメントアウト（実際には発生させない）
}

// エラーハンドリング
self.onerror = function(error) {
    console.error('エラーWorker: onErrorでキャッチ:', {
        message: error.message,
        filename: error.filename,
        lineno: error.lineno,
        colno: error.colno,
        error: error.error
    });

    // エラー情報をメインスレッドに送信
    self.postMessage(`エラーがキャッチされました: ${error.message}`);

    // trueを返すとエラーをキャンセル（デフォルトの処理を停止）
    // falseまたは何も返さないとエラーが親（メインスレッド）に伝播
    return false;
};

// 未処理のPromise拒否をキャッチ
self.addEventListener('unhandledrejection', function(event) {
    console.error('エラーWorker: 未処理のPromise拒否:', event.reason);
    self.postMessage(`未処理のPromise拒否: ${event.reason}`);

    // event.preventDefault() を呼ぶとコンソールエラーを防げる
    event.preventDefault();
});

console.log('エラーWorker が初期化されました（エラーテスト用）');