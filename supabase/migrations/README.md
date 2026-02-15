# Supabase Database Migrations

This directory contains all database migrations for the NeoBund1.com platform.

## Migration Files

Migrations are executed in chronological order based on their timestamp prefix:

1. `20260215120000_create_profiles_table.sql` - User profiles with credits system
2. `20260215120100_create_credit_transactions_table.sql` - Credit transaction history
3. `20260215120200_create_projects_table.sql` - Video generation projects
4. `20260215120300_create_assets_table.sql` - User-uploaded assets
5. `20260215120400_create_project_assets_table.sql` - Project-asset relationships
6. `20260215120500_create_generation_tasks_table.sql` - Async video generation tasks
7. `20260215120600_create_showcase_cases_table.sql` - Featured example videos
8. `20260215120700_create_user_favorites_table.sql` - User favorites
9. `20260215120800_create_digital_humans_table.sql` - Digital human avatars
10. `20260215120900_create_tiktok_accounts_table.sql` - TikTok account connections
11. `20260215121000_create_publish_tasks_table.sql` - TikTok publishing tasks
12. `20260215121100_create_activity_logs_table.sql` - Audit logs
13. `20260215121200_seed_showcase_cases.sql` - Initial showcase data

## Setup Instructions

### Prerequisites

- Supabase CLI installed: `npm install -g supabase`
- Supabase project created at https://supabase.com

### Local Development

1. Initialize Supabase locally:
```bash
supabase init
```

2. Start local Supabase:
```bash
supabase start
```

3. Apply migrations:
```bash
supabase db reset
```

4. Check migration status:
```bash
supabase migration list
```

### Production Deployment

1. Link to your Supabase project:
```bash
supabase link --project-ref <your-project-ref>
```

2. Push migrations to production:
```bash
supabase db push
```

3. Verify migrations:
```bash
supabase db remote commit
```

## Database Schema Overview

### Core Tables

- **profiles**: User accounts with credit balance and subscription tier
- **credit_transactions**: Audit trail for all credit changes
- **projects**: Video generation projects
- **assets**: User-uploaded images, videos, audio
- **generation_tasks**: Async video generation queue

### Content Tables

- **showcase_cases**: Platform's featured example videos
- **user_favorites**: User's favorited showcase cases
- **digital_humans**: User-created digital avatars

### Integration Tables

- **tiktok_accounts**: Connected TikTok accounts
- **publish_tasks**: TikTok video publishing queue
- **activity_logs**: User action audit trail

## Security Features

All tables implement Row Level Security (RLS):
- Users can only access their own data
- Public data (showcase cases) is readable by all
- Admin access via service_role key

## Triggers and Functions

- `update_updated_at_column()`: Auto-update timestamps
- `handle_new_user()`: Create profile on user signup
- `deduct_credits_on_task_creation()`: Auto-deduct credits
- `update_favorite_count()`: Maintain favorite counters

## Indexes

All tables have optimized indexes for:
- Foreign key lookups
- Timestamp-based queries
- Full-text search (where applicable)
- Array/JSONB queries (GIN indexes)

## Rollback

To rollback migrations:

```bash
# Local
supabase db reset

# Production (manual)
# Execute the "Down Migration" section from each file in reverse order
```

## Notes

- All timestamps use `timestamptz` (timezone-aware)
- UUIDs are generated via `gen_random_uuid()`
- JSONB fields allow flexible metadata storage
- Placeholder URLs in seed data should be replaced with actual CDN URLs
