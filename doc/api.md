# API ドキュメント

本プロジェクトのサーバー側 API 仕様です。Next.js App Router の Route Handlers を使用しています。

共通事項
- ベース URL: ローカル開発時は http://localhost:3000
- 認証: なし（Google API キーはサーバー側で保持）。`.env.local` に `GOOGLE_MAPS_API_KEY` を設定してください。
- レスポンス形式: JSON
- キャッシュ: `no-store`（毎回リクエストを転送）

環境変数
- GOOGLE_MAPS_API_KEY: Google Maps Platform の API キー


## 1. Name → Place Details バッチ解決 API
- エンドポイント: POST `/api/name-to-detail`
- 説明: 店名などの文字列配列から Google Places を用いて該当施設を解決し、Place Details を取得します。リクエストは内部で並行処理（バッチ）されます。
- 位置バイアス: `prefecture` に応じて円形バイアスを適用
  - tokyo: 半径 25km（中心: 35.6762, 139.6503）
  - fukuoka: 半径 15km（中心: 33.5902, 130.4017）

### リクエスト
- Content-Type: `application/json`
- Body
```
{
  "names": ["一蘭 天神本店", "スターバックス 渋谷"], // 必須、空でない文字列配列
  "prefecture": "fukuoka",                        // 必須: 'tokyo' | 'fukuoka'
  "language": "ja",                                // 任意、既定 'ja'
  "detailsFields": "shortFormattedAddress,primaryType,primaryTypeDisplayName,rating,userRatingCount,currentOpeningHours.openNow,regularOpeningHours.weekdayDescriptions,googleMapsUri,websiteUri,businessStatus" // 任意（既定）
}
```
- 備考
  - detailsFields の既定値は上記の通り（実装の `DETAILS_DEFAULT_FIELDS` と一致）。
  - セキュリティ/コスト配慮のため、`reviews` は常に除外されます（明示指定してもサーバー側でフィルタ）。

### レスポンス（200）
```
{
  "results": [
    {
      "name": "一蘭 天神本店",
      "placeId": "<Google Place ID>",
      "textSearch": { ...最初の Text Search の結果(最小限) ... },
      "details": { ...Place Details の結果（上記フィールド）... }
    }
  ],
  "errors": [
    // 各要素が以下の形
    // { "name": "入力名", "message": "No place found", "stage": "text-search", "details": { ...上流エラー... } }
  ]
}
```

### エラー応答
- 400 Bad Request
```
{ "error": "Invalid JSON body" }
```
```
{ "error": "Invalid field: names must be a non-empty array of strings" }
```
```
{ "error": "Invalid field: prefecture must be 'tokyo' or 'fukuoka'" }
```
- 500 Internal Server Error（サーバー設定不備など）
```
{ "error": "Server misconfiguration: GOOGLE_MAPS_API_KEY is not set" }
```

### 使用例（cURL）
```
curl -sS -X POST http://localhost:3000/api/name-to-detail \
  -H 'Content-Type: application/json' \
  -d '{
    "names": ["一蘭 天神本店"],
    "prefecture": "fukuoka",
    "language": "ja"
  }'
```

---

## 2. CSV アップロード画面（/upload-csv）
- 1列目の見出しが「タイトル」の CSV を想定します。先頭行をヘッダとしてスキップし、以降の行の1列目を抽出します。
- 重複は順序を保ったまま除外します。
- 都道府県（prefecture）は UI 上で `tokyo`/`fukuoka` から選択します。
- 抽出したタイトル配列をそのまま `/api/name-to-detail` に POST します。
- 成功/失敗件数、主要な Place Details フィールド（住所、評価、営業時間、Google Maps/公式サイトリンクなど）をリスト表示します。

Tips
- CSV の改行コード（CRLF/CR）を自動正規化します。Excel/スプレッドシート由来の CSV でもそのままアップロード可です。
- 先頭に BOM が付与された場合でも自動でトリムします。

---

## 参考（内部実装メモ）
- 内部では Google Places API v1 を使用
  - Text Search: `POST https://places.googleapis.com/v1/places:searchText`
    - FieldMask は ID 解決のため `places.id` のみを使用
  - Place Details: `GET https://places.googleapis.com/v1/places/{place_id}`
    - FieldMask は `detailsFields`（ただし `reviews` は常に除外）
- 並行処理: 5 件ずつのバッチで `Promise.all` を使用（各タスクで例外を握りつぶして成功/失敗を自前表現）。
- 失敗時は名前ごとに `errors` に格納（成功分は `results`）
