# NEXT STEPS

## Step 1: データモデル確定
- 利用者Profile（固定＋個別性）
- 看護計画（plan_id）
- 観察項目（型：number/select/boolean/text_exception）
- 記録（record_id + version + created_at + author）
- 報告書（yyyymm + patient + generated_at + source_record_ids）

## Step 2: 生成エンジン
- plan_id を受け取って observation schema を返す
- 例外ログは「理由必須」で保存（自由記載の穴を塞ぐ）

## Step 3: UI（iPad）
- 利用者選択 → 計画選択 → ボタン入力 → 生成結果コピー（iBow貼り付け想定）

## Step 4: GAS/Sheets連携
- 記録の正本保存（Sheets）
- 月次で報告書生成 → DriveにPDF保存
