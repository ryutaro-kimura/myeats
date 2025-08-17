# API ドキュメント

本プロジェクトのサーバー側 API 仕様です。Next.js App Router の Route Handlers を使用しています。

共通事項
- ベース URL: ローカル開発時は http://localhost:3000
- 認証: なし（Google API キーはサーバー側で保持）。`.env.local` に `GOOGLE_MAPS_API_KEY` を設定してください。
- レスポンス形式: JSON
- キャッシュ: `no-store`（毎回リクエストを転送）

環境変数
- GOOGLE_MAPS_API_KEY: Google Maps Platform の API キー


1. Places Text Search API プロキシ
- エンドポイント
  - POST `/api/text-search`
  - GET  `/api/text-search`
- 説明: Google Places Text Search API (v1) `places:searchText` をサーバーから呼び出します。
- 既定の取得フィールド（変更可）
  - `places.id,places.displayName,places.formattedAddress,places.location`

POST /api/text-search
- Content-Type: application/json
- Body
```
{
  "textQuery": "東京駅 寿司",            // 必須
  "pageSize": 10,                       // 任意 1..20
  "pageToken": "...",                 // 任意 続きページ用
  "languageCode": "ja",               // 任意 既定 ja
  "locationBias": {                     // 任意 サークルなど
    "circle": {
      "center": { "latitude": 35.68, "longitude": 139.76 },
      "radius": 500
    }
  }
}
```
- Query
  - `fields`（任意）: 例 `places.id,places.displayName,places.formattedAddress,places.location,places.websiteUri`
- 成功レスポンス（例）
```
{
  "places": [
    {
      "id": "ChIJAQAsR--LGGAR_AmB8WMDy88",
      "formattedAddress": "...",
      "location": { "latitude": 35.66, "longitude": 139.76 },
      "displayName": { "text": "GINZA SIX", "languageCode": "ja" }
    }
  ]
}
```

GET /api/text-search
- 説明: クエリから内部で POST ペイロードを組み立てて検索します
- Query
  - `q`（必須）: 検索文字列
  - `language`（任意、既定 ja）
  - `pageSize`（任意、1..20）
  - `pageToken`（任意）
  - `lat`,`lng`,`radius`（任意）: locationBias のサークルを構成
  - `fields`（任意）: 取得フィールド
- 例
```
GET /api/text-search?q=レストラン&language=ja&pageSize=2&lat=35.681364390920265&lng=139.7671035631151&radius=500&fields=places.id,places.displayName,places.formattedAddress,places.location,places.websiteUri
```


2. Place Details API プロキシ
- エンドポイント: GET `/api/place-details`
- 説明: Google Places Details API (v1) `GET /v1/places/{place_id}` をサーバーから呼び出します。
- 既定の取得フィールド（変更可）
  - `id,displayName,formattedAddress,internationalPhoneNumber,currentOpeningHours,reviews`

GET /api/place-details
- Query
  - `placeId`（必須）
  - `language`（任意、既定 ja）
  - `fields`（任意）: 例 `id,displayName,formattedAddress,internationalPhoneNumber,currentOpeningHours,reviews`
- 例
```
GET /api/place-details?placeId=ChIJAQAsR--LGGAR_AmB8WMDy88&language=ja&fields=id,displayName,formattedAddress,internationalPhoneNumber,currentOpeningHours,reviews
```

エラーレスポンス
- 共通して、上流 API エラーの際には以下の形式
```
{
  "error": "Upstream Places API error",
  "status": 400,
  "details": { ...Google からのエラー... }
}
```
- サーバー設定不備
```
{
  "error": "Server misconfiguration: GOOGLE_MAPS_API_KEY is not set"
}
```

注意事項
- API キーは必ずサーバー側環境変数で管理し、クライアントへ露出しないでください。
- `X-Goog-FieldMask` は必要なフィールドのみ指定し、不要なデータの転送を避けてコストを最適化してください。
- Google Places API の課金・利用制限に注意してください。
