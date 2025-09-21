// 重い計算処理を行うWorkerスクリプト
// メインスレッドをブロックしないで数学的計算を実行

self.onmessage = function(e) {
    const { range } = e.data;

    if (!range || typeof range !== 'number' || range <= 0) {
        self.postMessage({
            type: 'error',
            data: { message: '有効な範囲を指定してください' }
        });
        return;
    }

    console.log(`計算Worker開始: 範囲 1 から ${range}`);

    let sum = 0;
    const reportInterval = Math.max(1, Math.floor(range / 100)); // 進捗報告の間隔

    // 重い計算処理：平方根の合計を計算
    for (let i = 1; i <= range; i++) {
        // 計算処理
        sum += Math.sqrt(i);

        // さらに重い処理をシミュレート（フィボナッチ数列の計算など）
        if (i % 1000 === 0) {
            // 小さなフィボナッチ計算を追加
            fibonacci(15);
        }

        // 進捗報告
        if (i % reportInterval === 0 || i === range) {
            self.postMessage({
                type: 'progress',
                data: {
                    current: i,
                    total: range,
                    percentage: (i / range) * 100
                }
            });
        }

        // 他のタスクに処理を譲る（長時間のブロックを防ぐ）
        if (i % 10000 === 0) {
            // 次のイベントループに処理を移す（同期的に少し待機）
            const start = Date.now();
            while (Date.now() - start < 1) {
                // 1ms待機
            }
        }
    }

    // 最終結果を送信
    self.postMessage({
        type: 'result',
        data: {
            result: sum,
            range: range,
            completedAt: new Date().toISOString()
        }
    });

    console.log(`計算Worker完了: 結果 ${sum.toFixed(2)}`);
};

// フィボナッチ数列の計算（重い処理のシミュレート）
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

// 素数判定（さらに重い処理のシミュレート）
function isPrime(num) {
    if (num <= 1) return false;
    if (num <= 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;

    for (let i = 5; i * i <= num; i += 6) {
        if (num % i === 0 || num % (i + 2) === 0) return false;
    }

    return true;
}

// 複雑な数学計算
function complexCalculation(n) {
    let result = 0;
    for (let i = 1; i <= n; i++) {
        result += Math.sin(i) * Math.cos(i) * Math.log(i + 1);
        if (isPrime(i)) {
            result += Math.sqrt(i);
        }
    }
    return result;
}

// エラーハンドリング
self.onerror = function(error) {
    console.error('計算Worker内でエラーが発生:', error);
    self.postMessage({
        type: 'error',
        data: { message: error.message, filename: error.filename, lineno: error.lineno }
    });
};

console.log('計算Worker が初期化されました');