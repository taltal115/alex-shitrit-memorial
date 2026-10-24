#!/bin/bash
# Complete migration test: 001-011 on clean Postgres
# Includes migrations from PR #7 (007), PR #8 (008), and PR #9 (009-011)

set -e

echo "=== Complete PostgreSQL Migration Test ==="
echo "PostgreSQL $(sudo -u postgres psql -tAc 'SELECT version()')"
echo ""

# Recreate database
echo "Creating fresh database..."
sudo -u postgres psql -c "DROP DATABASE IF EXISTS memorial_test;" > /dev/null
sudo -u postgres psql -c "CREATE DATABASE memorial_test;" > /dev/null
sudo -u postgres psql -d memorial_test -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;" > /dev/null

# Set up auth stub
echo "Setting up auth stub..."
sudo -u postgres psql -d memorial_test -f supabase/migrations/000_stub_auth.sql > /dev/null 2>&1

echo ""
echo "=== Running All Migrations 001-011 ===" 
echo ""

# Run migrations in order
for num in 001 002 003 004 005 006 007 008 009 010 011; do
    file=$(ls supabase/migrations/${num}_*.sql 2>/dev/null | head -1)
    if [ -z "$file" ]; then
        echo "❌ Migration $num not found"
        exit 1
    fi
    
    basename_file=$(basename "$file")
    echo "[$num] Running $basename_file..."
    
    if sudo -u postgres psql -d memorial_test -f "$file" > /tmp/migration_${num}.log 2>&1; then
        # Show last few lines of output
        tail -2 /tmp/migration_${num}.log | sed 's/^/     /'
        echo "     ✓ SUCCESS"
    else
        echo "     ❌ FAILED"
        echo ""
        echo "Error output:"
        cat /tmp/migration_${num}.log | tail -30
        exit 1
    fi
    echo ""
done

echo "=== Migration Chain Complete ==="
echo "✓ All migrations 001-011 executed successfully"
echo "✓ PR #7 (007): Psalm 119 spelling corrections"  
echo "✓ PR #8 (008): Death date verification"
echo "✓ PR #9 (009-011): Security fixes"
echo ""

# Verify key tables and policies
echo "=== Verification ==="
sudo -u postgres psql -d memorial_test << 'EOSQL'
SELECT 'Tables created: ' || count(*)::text FROM information_schema.tables WHERE table_schema = 'public';
SELECT 'RLS policies: ' || count(*)::text FROM pg_policies WHERE schemaname = 'public';
SELECT 'Functions created: ' || count(*)::text FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public';
EOSQL

echo ""
echo "Database ready for production!"
