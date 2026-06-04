# AWS Migration Start Guide (Phase 1)

This guide is the execution starting point for moving this project from Supabase to AWS.

## 0) Source of Truth Locked

Use this Supabase project as migration source:
- project ref: gzawvtlehnujtviahdbv

Checked and aligned in:
- supabase.json
- .env
- src/utils/supabase/info.tsx

## 1) Decide AWS Targets (recommended defaults)

- API runtime: Lambda + API Gateway
- Main app data: DynamoDB (KV model)
- Blog SQL data: RDS PostgreSQL
- File storage: S3 (+ CloudFront optional)
- Auth: Cognito
- Secrets: AWS Secrets Manager
- Logs/alerts: CloudWatch

## 2) Create AWS bootstrap resources

Create these first in dev environment:
- IAM role for migration operators
- KMS key for secrets/data
- S3 buckets:
  - certifyer-dev-uploads
  - certifyer-dev-blog-images
  - certifyer-dev-migration-backups
- DynamoDB table: certifyer-dev-kv
  - PK: key (string)
- RDS PostgreSQL instance: certifyer-dev-db
- API Gateway + Lambda placeholder for /health

## 3) Export current Supabase data (baseline)

Run from repo root.

### 3.1 KV table export

Use SQL export from Supabase dashboard for table:
- kv_store_a611b057

Or with psql if you have connection details:

COPY (SELECT key, value FROM kv_store_a611b057 ORDER BY key)
TO 'kv_store_a611b057.csv' WITH CSV HEADER;

### 3.2 blog_posts SQL export

Use pg_dump for schema + data:

pg_dump "<SUPABASE_POSTGRES_URL>" --table=public.blog_posts --data-only --column-inserts > blog_posts_data.sql

### 3.3 Storage export

Download all objects from buckets:
- make-a611b057-uploads
- blog-images

Keep original object paths. Preserve metadata where possible.

## 4) Import to AWS targets

### 4.1 Import KV to DynamoDB

Transform each CSV row into a DynamoDB item:
- key: original key
- value: original JSON/text payload

### 4.2 Import blog_posts to RDS

Create schema from supabase/migrations/20260325170000_create_blog_posts_table.sql, then apply blog_posts_data.sql.

### 4.3 Upload files to S3

- make-a611b057-uploads -> certifyer-dev-uploads
- blog-images -> certifyer-dev-blog-images

## 5) Backend migration implementation order

1. Port /health, /auth/session, /templates read endpoints first.
2. Replace KV adapter in supabase/functions/make-server-a611b057/kv_store.tsx logic with DynamoDB repository in AWS service.
3. Replace storage upload/signed URL logic with S3 pre-signed URLs.
4. Port auth endpoints to Cognito-compatible flow.
5. Port billing and webhook endpoints last.

## 6) Frontend switchover order

1. Replace hardcoded Supabase project URL assembly with a single environment API base URL.
2. Keep current Authorization: Bearer token pattern during first cut.
3. Switch API base URL in staging only.
4. Run E2E smoke tests.

## 7) Cutover checklist (1-3 hour maintenance window)

- Freeze writes in Supabase
- Run final delta export (KV + blog + storage)
- Import delta to AWS
- Switch frontend API base URL to AWS
- Validate:
  - login/signup
  - certificate generation
  - file uploads/downloads
  - billing initialize/verify
- Keep rollback path for 24-72 hours

## 8) Definition of done for Phase 1

- Source project consistency verified
- Baseline export completed and archived
- AWS dev targets provisioned
- Initial /health endpoint live in AWS
- Data parity report generated (counts by key prefix + blog row count + storage object count)
