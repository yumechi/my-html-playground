// Service Worker スクリプト
// ネットワークリクエストのインターセプト、キャッシュ管理、バックグラウンド処理を行う

const CACHE_NAME = 'sw-cache-v1';
const CACHE_VERSION = '1.0.0';

// キャッシュするリソースのリスト (GitHub Pages 対応)
const CACHED_RESOURCES = [
    './',
    './serviceworkers-sample.html',
    './css/serviceworkers-style.css',
    './js/basic-worker.js',
    // 外部APIも事前キャッシュ可能
    'https://jsonplaceholder.typicode.com/posts/1'
];

// Service Workerのインストール時
self.addEventListener('install', function(event) {
    console.log('Service Worker: インストール中...', event);

    // インストール処理を待機
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Service Worker: キャッシュを開きました');
                // 重要なリソースを事前キャッシュ
                return cache.addAll(CACHED_RESOURCES.filter(url => !url.startsWith('http')));
            })
            .then(function() {
                console.log('Service Worker: インストール完了');
                // すぐにアクティブ化
                return self.skipWaiting();
            })
            .catch(function(error) {
                console.error('Service Worker: インストールエラー', error);
            })
    );
});

// Service Workerのアクティベーション時
self.addEventListener('activate', function(event) {
    console.log('Service Worker: アクティベーション中...', event);

    event.waitUntil(
        caches.keys()
            .then(function(cacheNames) {
                return Promise.all(
                    cacheNames.map(function(cacheName) {
                        // 古いキャッシュを削除
                        if (cacheName !== CACHE_NAME) {
                            console.log('Service Worker: 古いキャッシュを削除:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(function() {
                console.log('Service Worker: アクティベーション完了');
                // すべてのタブを制御下に置く
                return self.clients.claim();
            })
    );
});

// ネットワークリクエストのインターセプト
self.addEventListener('fetch', function(event) {
    const request = event.request;
    const url = new URL(request.url);

    // 特定の条件でのみ処理（HTMLとAPI リクエスト）
    if (request.method !== 'GET') {
        return; // GETリクエスト以外は処理しない
    }

    console.log('Service Worker: リクエストをインターセプト:', request.url);

    event.respondWith(
        caches.match(request)
            .then(function(cachedResponse) {
                // キャッシュがある場合
                if (cachedResponse) {
                    console.log('Service Worker: キャッシュから応答:', request.url);

                    // バックグラウンドでキャッシュを更新（stale-while-revalidate戦略）
                    event.waitUntil(
                        fetch(request)
                            .then(function(fetchResponse) {
                                if (fetchResponse && fetchResponse.status === 200) {
                                    const responseClone = fetchResponse.clone();
                                    caches.open(CACHE_NAME)
                                        .then(function(cache) {
                                            cache.put(request, responseClone);
                                        });
                                }
                            })
                            .catch(function() {
                                // ネットワークエラーは無視（オフライン時など）
                            })
                    );

                    return cachedResponse;
                }

                // キャッシュがない場合はネットワークから取得
                return fetch(request)
                    .then(function(fetchResponse) {
                        // レスポンスが有効な場合のみキャッシュ
                        if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
                            return fetchResponse;
                        }

                        // レスポンスをクローンしてキャッシュに保存
                        const responseToCache = fetchResponse.clone();
                        caches.open(CACHE_NAME)
                            .then(function(cache) {
                                cache.put(request, responseToCache);
                                console.log('Service Worker: 新しいレスポンスをキャッシュ:', request.url);
                            });

                        return fetchResponse;
                    })
                    .catch(function(error) {
                        console.log('Service Worker: ネットワークエラー:', request.url, error);

                        // オフライン時のフォールバック応答
                        if (request.destination === 'document') {
                            // HTMLページの場合はオフラインページを返す
                            return new Response(
                                `<!DOCTYPE html>
                                <html lang="ja">
                                <head>
                                    <meta charset="UTF-8">
                                    <title>オフライン</title>
                                    <style>
                                        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                                        .offline { color: #666; }
                                    </style>
                                </head>
                                <body>
                                    <div class="offline">
                                        <h1>オフライン</h1>
                                        <p>インターネット接続を確認してください。</p>
                                        <button onclick="location.reload()">再試行</button>
                                    </div>
                                </body>
                                </html>`,
                                {
                                    headers: { 'Content-Type': 'text/html' }
                                }
                            );
                        }

                        // APIリクエストの場合はオフライン用のJSONを返す
                        if (request.url.includes('/api/') || request.url.includes('jsonplaceholder')) {
                            return new Response(
                                JSON.stringify({
                                    error: 'オフライン',
                                    message: 'ネットワークに接続できません',
                                    timestamp: new Date().toISOString(),
                                    offline: true
                                }),
                                {
                                    headers: { 'Content-Type': 'application/json' }
                                }
                            );
                        }

                        // その他のリクエストはエラーを投げる
                        throw error;
                    });
            })
    );
});

// プッシュ通知の受信
self.addEventListener('push', function(event) {
    console.log('Service Worker: プッシュ通知を受信:', event);

    let notificationData = {
        title: 'Service Worker からの通知',
        body: 'プッシュ通知が届きました',
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        tag: 'push-notification',
        data: {
            url: '/',
            timestamp: Date.now()
        }
    };

    // プッシュデータがある場合は解析
    if (event.data) {
        try {
            const pushData = event.data.json();
            notificationData = { ...notificationData, ...pushData };
        } catch (e) {
            notificationData.body = event.data.text();
        }
    }

    event.waitUntil(
        self.registration.showNotification(notificationData.title, notificationData)
    );
});

// 通知のクリック処理
self.addEventListener('notificationclick', function(event) {
    console.log('Service Worker: 通知がクリックされました:', event);

    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window' })
            .then(function(clientList) {
                // 既存のタブがある場合はフォーカス
                for (let i = 0; i < clientList.length; i++) {
                    const client = clientList[i];
                    if (client.url === '/' && 'focus' in client) {
                        return client.focus();
                    }
                }

                // 新しいタブを開く
                if (clients.openWindow) {
                    return clients.openWindow('./');
                }
            })
    );
});

// バックグラウンド同期
self.addEventListener('sync', function(event) {
    console.log('Service Worker: バックグラウンド同期:', event.tag);

    if (event.tag === 'background-sync') {
        event.waitUntil(
            performBackgroundSync()
        );
    }
});

// バックグラウンド同期の実行
async function performBackgroundSync() {
    try {
        console.log('Service Worker: バックグラウンド同期を実行中...');

        // IndexedDBから同期待ちのデータを取得
        const syncData = await getSyncData();

        for (const data of syncData) {
            try {
                // サーバーにデータを送信
                const response = await fetch('/api/sync', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    // 成功した場合はデータを削除
                    await removeSyncData(data.id);
                    console.log('Service Worker: 同期完了:', data.id);
                }
            } catch (error) {
                console.error('Service Worker: 同期エラー:', error);
            }
        }

        // 同期完了通知
        await self.registration.showNotification('バックグラウンド同期', {
            body: '同期が完了しました',
            tag: 'sync-complete'
        });

    } catch (error) {
        console.error('Service Worker: バックグラウンド同期エラー:', error);
    }
}

// 同期データの取得（簡略化版）
async function getSyncData() {
    // 実際にはIndexedDBから取得
    return [];
}

// 同期データの削除（簡略化版）
async function removeSyncData(id) {
    // 実際にはIndexedDBから削除
    console.log('Sync data removed:', id);
}

// メッセージ受信（クライアントからの通信）
self.addEventListener('message', function(event) {
    console.log('Service Worker: メッセージを受信:', event.data);

    const { type, payload } = event.data;

    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;

        case 'GET_VERSION':
            event.ports[0].postMessage({ version: CACHE_VERSION });
            break;

        case 'CLEAN_CACHE':
            cleanOldCache()
                .then(() => {
                    event.ports[0].postMessage({ success: true });
                })
                .catch(error => {
                    event.ports[0].postMessage({ error: error.message });
                });
            break;

        case 'CACHE_URL':
            cacheSpecificUrl(payload.url)
                .then(() => {
                    event.ports[0].postMessage({ success: true });
                })
                .catch(error => {
                    event.ports[0].postMessage({ error: error.message });
                });
            break;

        default:
            console.log('Service Worker: 不明なメッセージタイプ:', type);
    }
});

// 古いキャッシュのクリーンアップ
async function cleanOldCache() {
    const cacheNames = await caches.keys();
    const oldCaches = cacheNames.filter(name => name !== CACHE_NAME);

    await Promise.all(
        oldCaches.map(name => caches.delete(name))
    );

    console.log('Service Worker: 古いキャッシュを削除しました:', oldCaches);
}

// 特定URLのキャッシュ
async function cacheSpecificUrl(url) {
    const cache = await caches.open(CACHE_NAME);
    await cache.add(url);
    console.log('Service Worker: URLをキャッシュしました:', url);
}

// エラーハンドリング
self.addEventListener('error', function(event) {
    console.error('Service Worker: エラーが発生:', event.error);
});

// 未処理のPromise拒否
self.addEventListener('unhandledrejection', function(event) {
    console.error('Service Worker: 未処理のPromise拒否:', event.reason);
    event.preventDefault();
});

console.log('Service Worker: 初期化完了 - Version', CACHE_VERSION);