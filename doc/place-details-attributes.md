# Place Details レスポンス属性一覧（Google Places API v1）

本ドキュメントは、Place Details API（`GET /v1/places/{place_id}`）を広い FieldMask（例: `*` や多くのフィールドを列挙）で取得した際に、レスポンスに含まれうる代表的な属性の一覧です。

注意
- 本プロジェクトの公開 API（/api/name-to-detail）では、既定で必要最小限のフィールドのみを取得し、`reviews` はコスト・パフォーマンスとセキュリティ配慮のためサーバー側で除外します。
- ここで列挙する属性は Google の提供状況で変わる可能性があり、すべてが常に返るわけではありません。

## 属性ごとの説明（表形式：サンプルからの推測）

### 基本属性
| 属性 | 説明 |
|---|---|
| name | リソース名。`places/{place_id}` の形式 |
| id | Google Place ID。API の主キー |
| types[] | 施設タイプの配列（例: ramen_restaurant, restaurant など） |
| formattedAddress | 人間可読な住所（ローカライズ済み） |
| googleMapsUri | Google マップの場所ページ URL |
| websiteUri | 公式サイトなど外部 Web サイトの URL |
| rating | 平均評価（0.0–5.0） |
| userRatingCount | レビュー件数 |
| businessStatus | 営業ステータス（例: OPERATIONAL） |
| priceLevel | 価格帯（例: PRICE_LEVEL_MODERATE） |
| shortFormattedAddress | 簡略化された住所表記 |
| primaryType | 主タイプの機械可読キー（例: ramen_restaurant） |
| iconMaskBaseUri | マップピンのアイコンベース URI |
| iconBackgroundColor | アイコン背景色（HEX） |
| utcOffsetMinutes | 現地タイムゾーンの UTC からの分オフセット（日本は 540） |
| adrFormatAddress | ADR マイクロフォーマットの住所（HTML） |
| pureServiceAreaBusiness | サービス提供エリア型ビジネスかどうか |

### 表示名/要約
| 属性 | 説明 |
|---|---|
| displayName.text | 表示名のテキスト |
| displayName.languageCode | 表示名の言語コード |
| primaryTypeDisplayName.text | 主タイプ表示名のテキスト（ローカライズ） |
| primaryTypeDisplayName.languageCode | 主タイプ表示名の言語コード |
| editorialSummary.text | 編集済みの紹介文テキスト |
| editorialSummary.languageCode | 紹介文の言語コード |

### 電話番号
| 属性 | 説明 |
|---|---|
| nationalPhoneNumber | 国内向け表記の電話番号（例: 050-xxxx-xxxx） |
| internationalPhoneNumber | 国際電話向け表記（例: +81 …） |

### 位置・範囲・Plus Code
| 属性 | 説明 |
|---|---|
| location.latitude | 緯度（WGS84） |
| location.longitude | 経度（WGS84） |
| viewport.low.latitude | 表示矩形の南側（緯度） |
| viewport.low.longitude | 表示矩形の西側（経度） |
| viewport.high.latitude | 表示矩形の北側（緯度） |
| viewport.high.longitude | 表示矩形の東側（経度） |
| plusCode.globalCode | Plus Code（グローバルコード） |
| plusCode.compoundCode | Plus Code（エリア付きコード） |

### 住所
| 属性 | 説明 |
|---|---|
| addressComponents[].longText | 住所構成要素の長い表記 |
| addressComponents[].shortText | 短い表記 |
| addressComponents[].types[] | 要素のタイプ（postal_code, country, locality 等） |
| addressComponents[].languageCode | 要素の言語コード |
| postalAddress.regionCode | 地域コード（例: JP） |
| postalAddress.languageCode | 住所の言語コード |
| postalAddress.postalCode | 郵便番号 |
| postalAddress.administrativeArea | 都道府県相当 |
| postalAddress.addressLines[] | 自由形式の住所行 |

### 営業時間
| 属性 | 説明 |
|---|---|
| regularOpeningHours.openNow | 現在営業中か |
| regularOpeningHours.weekdayDescriptions[] | 各曜日の説明（ローカライズ） |
| regularOpeningHours.periods[].open.day/hour/minute | 営業開始（曜日/時/分） |
| regularOpeningHours.periods[].close.day/hour/minute | 営業終了（曜日/時/分） |
| currentOpeningHours.* | 現在時点の営業時間（構造は regular と同様） |

### レビュー（既定では除外）
| 属性 | 説明 |
|---|---|
| reviews[].name | レビューリソース名 |
| reviews[].relativePublishTimeDescription | 相対時刻（例: 「1 か月前」） |
| reviews[].rating | レビュー評価 |
| reviews[].text.text / languageCode | レビュー本文とその言語 |
| reviews[].originalText.text / languageCode | 元文とその言語 |
| reviews[].authorAttribution.displayName | 投稿者名 |
| reviews[].authorAttribution.uri | 投稿者ページ URI |
| reviews[].authorAttribution.photoUri | 投稿者アイコン URI |
| reviews[].publishTime | ISO 8601 の公開日時 |
| reviews[].flagContentUri / googleMapsUri | 報告/表示用リンク |

### 写真
| 属性 | 説明 |
|---|---|
| photos[].name | 写真リソース名 |
| photos[].widthPx / heightPx | 解像度（px） |
| photos[].authorAttributions[].displayName | 著作者名 |
| photos[].authorAttributions[].uri | 著作者ページ |
| photos[].authorAttributions[].photoUri | 著作者アイコン |
| photos[].flagContentUri / googleMapsUri | 報告/表示用リンク |

### 提供形態/設備
| 属性 | 説明 |
|---|---|
| takeout / delivery / dineIn | テイクアウト/デリバリー/店内飲食の可否 |
| curbsidePickup / reservable | カーブサイド受取/予約可否 |
| servesBreakfast / servesLunch / servesDinner | 朝/昼/夜メニュー提供 |
| servesBeer / servesWine / servesCocktails | 酒類提供可否 |
| servesDessert / servesCoffee / servesBrunch / servesVegetarianFood | デザート/コーヒー/ブランチ/ベジ対応 |
| outdoorSeating / liveMusic / menuForChildren | 屋外席/ライブ/子供向けメニュー |
| goodForChildren / allowsDogs / restroom / goodForWatchingSports | 子供向け/ペット/トイレ/スポーツ観戦適性 |

### 決済/駐車/アクセシビリティ
| 属性 | 説明 |
|---|---|
| paymentOptions.acceptsCreditCards | クレジットカード可否 |
| paymentOptions.acceptsDebitCards | デビットカード可否 |
| paymentOptions.acceptsCashOnly | 現金のみか |
| paymentOptions.acceptsNfc | NFC 決済可否 |
| parkingOptions.freeParkingLot / paidParkingLot | 平面駐車場（無料/有料） |
| parkingOptions.valetParking | 代行駐車可否 |
| parkingOptions.freeGarageParking / paidGarageParking | 立体駐車場（無料/有料） |
| accessibilityOptions.wheelchairAccessibleParking | 車いす対応駐車場 |
| accessibilityOptions.wheelchairAccessibleEntrance | 車いす対応入口 |
| accessibilityOptions.wheelchairAccessibleSeating | 車いす対応座席 |

### 周辺・リンク・価格・タイムゾーン
| 属性 | 説明 |
|---|---|
| addressDescriptor.landmarks[].placeId | 周辺ランドマークの Place ID |
| addressDescriptor.landmarks[].displayName.text | ランドマーク名 |
| addressDescriptor.landmarks[].types[] | ランドマークのタイプ |
| addressDescriptor.landmarks[].spatialRelationship | 位置関係（例: AROUND_THE_CORNER） |
| addressDescriptor.landmarks[].straightLineDistanceMeters | 直線距離（m） |
| addressDescriptor.landmarks[].travelDistanceMeters | 移動距離（m） |
| addressDescriptor.areas[].displayName.text | エリア名 |
| addressDescriptor.areas[].containment | 含まれ方（WITHIN/OUTSKIRTS 等） |
| googleMapsLinks.directionsUri / placeUri | ルート/場所ページ |
| googleMapsLinks.writeAReviewUri / reviewsUri / photosUri | レビュー投稿/一覧/写真 |
| priceRange.startPrice.currencyCode / units | 価格帯（開始）の通貨コード/金額 |
| priceRange.endPrice.currencyCode / units | 価格帯（終了）の通貨コード/金額 |
| timeZone.id | IANA タイムゾーン ID（例: Asia/Tokyo） |

メモ
- 実際のレスポンスは FieldMask に依存。不要なフィールドはコスト増・レイテンシ増につながるため最小化を推奨。
- 本プロジェクトの `/api/name-to-detail` は reviews を除外し、必要最小限の detailsFields を既定で使用します。
