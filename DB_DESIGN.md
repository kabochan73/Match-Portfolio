# DB設計(v2・全面再設計)

`REQUIREMENTS.md` の内容をもとにしたテーブル設計。DBはPostgreSQLを想定。

前バージョンからの主な変更点は本ドキュメント末尾の「5. 前バージョンからの変更点」を参照。

## 1. ER図

```mermaid
erDiagram
    COMPANIES ||--o{ JOB_POSTINGS : "posts"
    USERS ||--o{ WORK_EXPERIENCES : "has"
    USERS ||--o{ EDUCATIONS : "has"
    USERS ||--o{ CERTIFICATIONS : "has"
    USERS ||--o{ LIKES : "applies (=likes)"
    JOB_POSTINGS ||--o{ LIKES : "receives"
    LIKES ||--o{ MESSAGES : "has thread"
    COMPANIES ||--o{ PAYMENTS : "invoices"

    COMPANIES {
        bigint id PK
        string name
        string email UK
        string password
        string phone_number
        string prefecture
        string address_line
        smallint founded_year
        string member_count_range
        string website_url
        string stripe_id
    }
    USERS {
        bigint id PK
        string name
        string email UK
        string password
        string comment
        string portfolio_url
        date birth_date
    }
    JOB_POSTINGS {
        bigint id PK
        bigint company_id FK
        string title
        text description
        text desired_candidate
        string employment_type
        string status
        timestamp published_at
    }
    WORK_EXPERIENCES {
        bigint id PK
        bigint user_id FK
        string company_name
        date started_on
        date ended_on
        string employment_type
    }
    EDUCATIONS {
        bigint id PK
        bigint user_id FK
        string school_name
    }
    CERTIFICATIONS {
        bigint id PK
        bigint user_id FK
        string name
    }
    LIKES {
        bigint id PK
        bigint user_id FK
        bigint job_posting_id FK
        string like_type
        text motivation
        string status
        timestamp applied_at
        timestamp response_deadline
    }
    MESSAGES {
        bigint id PK
        bigint like_id FK
        string sender_type
        bigint sender_id
        text body
    }
    PAYMENTS {
        bigint id PK
        bigint company_id FK
        string stripe_invoice_id
        integer amount
        string status
    }
```

`notifications` と パスワードリセット用テーブルは、Laravel標準テーブルを使うため上記ER図には含めていない(詳細は「2. テーブル定義」末尾および「4. 補足」を参照)。

## 2. テーブル定義

### users(求職者)
| カラム | 型 | 制約 | 備考 |
|---|---|---|---|
| id | bigint | PK | |
| name | string | not null | |
| email | string | unique, not null | ログインID |
| password | string | not null | |
| comment | string(200) | nullable | 自己紹介コメント |
| portfolio_url | string | nullable | GitHub・個人ポートフォリオサイト等のURL |
| birth_date | date | not null | 生年月日。18歳以上60歳以下のみ許可(バックエンドは`now()->subYears()`で動的にバリデーション)。企業側の応募者一覧・詳細では年齢に変換して表示 |
| created_at / updated_at | timestamp | | |

### companies(企業。1社1アカウント)
| カラム | 型 | 制約 | 備考 |
|---|---|---|---|
| id | bigint | PK | |
| name | string | not null | 会社名 |
| email | string | unique, not null | ログインID |
| password | string | not null | |
| description | text | nullable | 会社概要 |
| phone_number | string | nullable | |
| prefecture | string | nullable | 所在地(都道府県) |
| address_line | string | nullable | 所在地(市区町村以下) |
| founded_year | unsigned smallint | nullable | 設立年 |
| member_count_range | string(enum) | nullable | メンバー数レンジ。`1_10` / `11_50` / `51_100` / `101_300` / `301_plus` |
| website_url | string | nullable | 企業WebサイトのURL |
| stripe_id | string | nullable, unique | Stripe顧客ID。カラム名はCashierの`Billable`トレイトが内部で決め打ち参照するため(Webhookでの顧客検索`findBillable`等)、Cashier標準の`stripe_id`に合わせる |
| created_at / updated_at | timestamp | | |

所在地は検索・絞り込みには使わない(job_postings.prefectureとは無関係)ため、`prefecture`と`address_line`を分けるのは表示上の整形のためのみ。Webサイトは要件に明記がないため今回は含めない(「6. 未決事項」参照)。

### work_experiences(求職者の職歴)
| カラム | 型 | 制約 | 備考 |
|---|---|---|---|
| id | bigint | PK | |
| user_id | bigint FK → users.id | not null | |
| company_name | string | not null | |
| started_on | date | not null | 在籍開始年月 |
| ended_on | date | nullable | 在籍終了年月。nullは在籍中を表す |
| employment_type | string(enum) | not null | `full_time` / `part_time` / `contract`(job_postingsと同じ区分) |
| created_at / updated_at | timestamp | | |

表示順は`started_on`の降順。0件でもよい(新卒・未経験者を想定)。

### educations(求職者の学歴)
| カラム | 型 | 制約 | 備考 |
|---|---|---|---|
| id | bigint | PK | |
| user_id | bigint FK → users.id | not null | |
| school_name | string | not null | |
| created_at / updated_at | timestamp | | |

### certifications(求職者の資格)
| カラム | 型 | 制約 | 備考 |
|---|---|---|---|
| id | bigint | PK | |
| user_id | bigint FK → users.id | not null | |
| name | string | not null | 資格名のみ(取得年月は管理しない) |
| created_at / updated_at | timestamp | | |

- unique制約: `(user_id, name)`(同一資格の重複登録を防止)

### job_postings(求人)
| カラム | 型 | 制約 | 備考 |
|---|---|---|---|
| id | bigint | PK | |
| company_id | bigint FK → companies.id | not null | |
| title | string | not null | |
| description | text | not null | 職務内容 |
| desired_candidate | text | not null | 求める人材像(応募資格・歓迎スキル等) |
| employment_type | string(enum) | not null | `full_time` / `part_time` / `contract` |
| prefecture | string(enum) | not null | 勤務地。都道府県に加え「リモート」を選択肢に含める(companiesの所在地と共通のenumを使うが、「リモート」は勤務地としての選択を想定した値であり、会社所在地としては通常選択しない)。検索の絞り込み条件 |
| salary_min | integer | not null | 月給(円)。表示のみ、絞り込みには使わない |
| salary_max | integer | not null | 月給(円)。表示のみ、絞り込みには使わない |
| status | string(enum) | not null, default `draft` | `draft` / `published` / `unpublished` / `closed`(下記参照) |
| published_at | timestamp | nullable | 初回公開日時 |
| created_at / updated_at | timestamp | | |

`status` の意味:
- `draft`: 作成済み・未公開
- `published`: 公開中(検索結果に表示)
- `unpublished`: 支払い未了により自動非公開(表示されないが企業側で確認・支払い登録可能)
- `closed`: 企業が募集終了(恒久的に非表示)

検索の絞り込み対象は「キーワード(`title`/`description`) + `prefecture` + `employment_type`」の3つのみ(要件4.2)。`salary_min`/`salary_max`は表示専用。

### likes(応募 = 求職者からの「いいね」)
求職者が求人に「いいね」した時点でレコードが作成される。「いいね」は求職者の応募意思そのものであり、応募(いいね)とは別に`applications`のような独立したテーブルは持たない。テーブル名は「いいね」という操作起点の呼び名を採用している。

| カラム | 型 | 制約 | 備考 |
|---|---|---|---|
| id | bigint | PK | |
| user_id | bigint FK → users.id | not null | |
| job_posting_id | bigint FK → job_postings.id | not null | |
| like_type | string(enum) | not null, default `standard` | `standard`(通常のいいね) / `super`(スーパーいいね) |
| motivation | text | not null | 志望動機。企業ごとに個別入力する自由記述(文字数上限なし) |
| status | string(enum) | not null, default `applied` | `applied` / `matched` / `expired`(下記参照) |
| applied_at | timestamp | not null | 求職者が「いいね」した日時 |
| response_deadline | timestamp | not null | `applied_at` + 7日。企業の反応期限(`like_type`によらず共通) |
| company_responded_at | timestamp | nullable | 企業が「気になる」を押した日時 |
| created_at / updated_at | timestamp | | |

- 部分ユニークインデックス: `UNIQUE (user_id, job_posting_id) WHERE status <> 'expired'`(反応待ち・マッチ成立中の同一求人への重複応募を防止する一方、`expired`[マッチ不成立]になった求人には再度いいね[応募]できるようにするため、`expired`のレコードはこの一意制約の対象外とする)

`status` の意味:
- `applied`: 求職者がいいね(応募)した直後。企業の反応待ち
- `matched`: 企業が7日以内に「気になる」を押し、マッチ成立。メッセージ開始可能
- `expired`: 7日以内に企業の反応がなく自動的に不成立(バッチ処理で更新)。同一求人への再応募が可能な状態

マッチ成立後の選考プロセス(書類選考・面接・内定など)はステータスとして管理しない(要件4.2「選考ステータス管理機能は設けない」)。そのためステータス変更履歴テーブルは持たない。

**月間上限(通常10件/スーパー1件、月初リセット)の数え方**: 専用のカウンタテーブルは設けず、`likes`を`user_id` + `like_type` + `applied_at`(当月分)でカウントするクエリで判定する。カウンタを別テーブルで持つと応募の取消等が発生した際に同期ズレのリスクがあるため、都度集計する方針とする。

### messages(応募単位のメッセージスレッド)
| カラム | 型 | 制約 | 備考 |
|---|---|---|---|
| id | bigint | PK | |
| like_id | bigint FK → likes.id | not null | |
| sender_type | string | not null | `user` / `company` |
| sender_id | bigint | not null | |
| body | text | not null | |
| read_at | timestamp | nullable | |
| created_at | timestamp | | |

面接日程調整は構造化された機能(候補日提示→確定)を持たず、マッチ成立後の`messages`でのやり取りに委ねる。そのため`interview_schedules`/`interview_schedule_slots`は持たない。

### payments(請求履歴)
| カラム | 型 | 制約 | 備考 |
|---|---|---|---|
| id | bigint | PK | |
| company_id | bigint FK → companies.id | not null | |
| stripe_invoice_id | string | unique, not null | |
| amount | integer | not null | 円単位(1000) |
| status | string(enum) | not null | `paid` / `failed` / `pending` |
| paid_at | timestamp | nullable | |
| created_at | timestamp | | |

企業のサブスクリプション自体(ステータス・現在の請求期間等)は独自テーブルを持たず、Laravel Cashier標準の`subscriptions`/`subscription_items`テーブル(`companies`を1 Stripe顧客、`name = "default"`の単一サブスクリプションとして扱う)をそのまま実体として使う。`payments`はStripe Webhookで同期する請求履歴のキャッシュのみ。

### notifications(アプリ内通知。Laravel標準テーブルを使用)
| カラム | 型 | 制約 | 備考 |
|---|---|---|---|
| id | uuid | PK | |
| type | string | not null | 通知クラス名 |
| notifiable_type | string | not null | `App\Models\User` / `App\Models\Company` |
| notifiable_id | bigint | not null | |
| data | json | not null | 通知内容(メッセージ, リンク等) |
| read_at | timestamp | nullable | |
| created_at / updated_at | timestamp | | |

### パスワードリセット用テーブル(要件4.1「パスワードリセット」に対応)
`users`と`companies`は別Sanctumガードの別テーブルであり、同じメールアドレスが両方に存在しうるため、Laravel標準の単一`password_reset_tokens`(emailキーのみで判定)をそのまま共用すると、求職者と企業でメールアドレスが一致した場合に誤って混同するリスクがある。そのためガードごとにテーブルを分離する。

| テーブル名 | 対象 | カラム |
|---|---|---|
| `password_reset_tokens` | users | `email`(PK), `token`, `created_at` |
| `company_password_reset_tokens` | companies | `email`(PK), `token`, `created_at` |

## 3. インデックス方針

- `job_postings(status, prefecture, employment_type)`(検索の絞り込み)
- `likes(user_id, like_type, applied_at)`(月間上限のカウント用)
- `likes(job_posting_id)`
- `messages(like_id, created_at)`
- `work_experiences(user_id)`
- `educations(user_id)`
- `certifications(user_id)`

## 4. 補足

- **求職者/企業の認証分離**: `users` と `companies` は別テーブル・別Sanctumガードで管理する(1社1アカウントのため `companies` がそのままログイン主体を兼ねる)。
- **メッセージの送信者**: `messages.sender_type` / `sender_id` は簡易ポリモーフィック。Eloquentの`morphTo`を使用してもよい。
- **課金と公開状態の連動**: 企業の`subscriptions`(Cashier標準テーブル)のステータスが`active`でない場合、その企業の`job_postings`は全件Stripe Webhook(`invoice.payment_failed`等)から`unpublished`に更新する。求人単位の課金ステータスは持たない。
- **Laravel Cashierとの関係**: 決済はLaravel Cashierを標準的な使い方で実装する。`Billable`トレイトを持つ`Company`を1 Stripe顧客とし、単一の名前付きサブスクリプション(`name = "default"`)を持たせる。Cashier標準の`subscriptions`/`subscription_items`テーブルをそのまま実体として使うため、アプリ独自のサブスクリプション用テーブルは不要。
- **マッチ失効バッチ**: Laravel Schedulerで定期的に `likes` を走査し、`status = applied` かつ `response_deadline` を過ぎているレコードを `status = expired` に更新する(`likes:expire`コマンド、1時間おき)。
- **支払い方法の登録タイミング**: 求人投稿自体にカード登録は不要。企業アカウントでカードを登録すると同時に`default`サブスクリプションの課金が(無料期間なく)開始され、以後は求人数に関わらず月額固定で使い放題になる。決済に失敗した場合はWebhookで検知し、その企業の求人をすべて`unpublished`にする。
- **enum系カラムの実装方針**: `employment_type` / `like_type` / `status` 系のenumはPostgreSQLのネイティブenum型は使わず、`string`カラム + CHECK制約(例: `CHECK (status IN ('draft','published','unpublished','closed'))`)で実装する。ネイティブenum型は値の追加・削除が`ALTER TYPE`絡みで扱いにくいため、CHECK制約であればマイグレーションで制約を貼り替えるだけで値の変更に対応できる。これに加えて、Laravel側でも引き続きPHP enumキャスト・FormRequestによるバリデーションを行う(CHECK制約はService層をバイパスした不正な値の混入を防ぐ最後の防波堤であり、ユーザー向けエラーメッセージの返却はLaravel側の責務のため、両方を併用する)。

## 5. 前バージョンからの変更点

要件定義の見直しに合わせてゼロから設計し直した結果、以下の実質的な変更がある(単なる書き直しではなく、要件との突き合わせで見つかった漏れ・過剰設計の是正)。

| 変更 | 内容 | 理由 |
|---|---|---|
| `job_postings.job_type` は追加後、最終的に削除 | 旧設計にはこのカラム自体が存在せず、一度は欠落是正として追加したが、その後「職種」自体を求人の管理項目から外す判断をしたため最終的に削除 | 要件4.2から「職種」表示の記載自体を削除したため不要に |
| `applications.like_type` を追加 | 通常いいね/スーパーいいねを区別するカラムがなかった | 要件4.2の月間上限(通常10件/スーパー1件を別枠管理)を実装できなかった(欠落) |
| `job_postings.work_style` / `position_level` / `min_experience_years` を削除 | 旧設計にあったが要件に一切記載がない項目 | 過剰設計。必要になれば要件を確認した上で追加する |
| `job_posting_skills`(求人への必須スキル)を削除 | 旧設計にあったが要件は求職者側のスキルのみ言及 | 過剰設計。求人と求職者のスキルマッチングは要件に含まれない |
| `application_status_histories` を削除 | 旧設計にあったが要件4.2は明確に「選考ステータス管理機能は設けない」と規定 | 要件と矛盾する機能を実装してしまっていた |
| `password_reset_tokens` / `company_password_reset_tokens` を追加 | 旧設計には一切存在しなかった | 要件4.1「パスワードリセット」を満たすテーブルが欠落していた |
| `users.birthdate` を削除 | 旧設計にあったが要件のプロフィール項目(氏名・自己PR・スキル)に含まれない | 過剰設計 |

**2026-08-03追記**: 課金モデルを「求人ごとの個別サブスクリプション+14日間無料トライアル」から「企業単位の単一サブスクリプション・トライアルなし」に変更し、`job_posting_subscriptions`テーブルを廃止した。求人単位のトライアルは、求人を削除して同じ内容で再投稿すれば何度でも使い回せてしまう抜け穴があったため。企業単位のトライアルであれば求人の削除では回避できないが、そもそもシンプルさを優先しトライアル自体を撤廃した。

**2026-08-05追記**: `users.birth_date`を追加した(v1→v2移行時点では要件のプロフィール項目に含まれず一度削除していたもの)。企業側の応募者一覧・詳細で年齢を確認できるようにする要件が追加されたため復活させ、18〜60歳の範囲でバリデーションする。pre-launch段階のため、新規ALTERマイグレーションではなく`users`作成マイグレーションを直接編集し`migrate:fresh`で反映した。

**2026-08-08追記**: 過去の「未決事項」4件を決定し反映した。
- `companies.founded_year`(設立年)・`companies.member_count_range`(メンバー数レンジ)・`companies.website_url`(WebサイトURL)を追加した。前身プロジェクトの実装確認で判明した抜け(founded_year/member_count_range)と、未決だったWebサイトURLの追加を同時に反映
- `job_postings.prefecture` に「リモート」を選択肢として含めることにした。`companies.prefecture`と共通のenumを使う(リモート専用カラムは新設しない)
- `likes` の一意制約を単純な`UNIQUE(user_id, job_posting_id)`から部分ユニークインデックス`UNIQUE (user_id, job_posting_id) WHERE status <> 'expired'`に変更し、`expired`(マッチ不成立)後の再応募を許容するようにした
- `job_postings.desired_candidate` / `salary_min` / `salary_max` を`nullable`から`not null`に変更し、必須項目に統一した
- enum系カラムの実装方針を「`string`カラム + CHECK制約」に決定した(詳細は「4. 補足」参照)

## 6. 未決事項

(現時点でなし)
