#!/bin/bash

# Setup Interview Database
# 创建和初始化面试管理数据库

set -e  # Exit on error

echo "========================================="
echo "  Interview Database Setup"
echo "========================================="
echo ""

# MySQL connection settings
MYSQL_USER="root"
MYSQL_HOST="localhost"
MYSQL_PORT="3306"

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "Step 1: Creating database schema..."
mysql -u $MYSQL_USER -h $MYSQL_HOST -P $MYSQL_PORT < "$SCRIPT_DIR/create_interview_db.sql"

if [ $? -eq 0 ]; then
    echo "✓ Database schema created successfully"
else
    echo "✗ Failed to create database schema"
    exit 1
fi

echo ""
echo "Step 2: Loading seed data (Part 1 - Basic data)..."
mysql -u $MYSQL_USER -h $MYSQL_HOST -P $MYSQL_PORT < "$SCRIPT_DIR/seed_interview_data.sql"

if [ $? -eq 0 ]; then
    echo "✓ Seed data part 1 loaded successfully"
else
    echo "✗ Failed to load seed data part 1"
    exit 1
fi

echo ""
echo "Step 3: Loading seed data (Part 2 - Applications & Interview Rounds)..."
mysql -u $MYSQL_USER -h $MYSQL_HOST -P $MYSQL_PORT < "$SCRIPT_DIR/seed_interview_data_part2.sql"

if [ $? -eq 0 ]; then
    echo "✓ Seed data part 2 loaded successfully"
else
    echo "✗ Failed to load seed data part 2"
    exit 1
fi

echo ""
echo "Step 4: Loading seed data (Part 3 - Interviews & Feedback)..."
mysql -u $MYSQL_USER -h $MYSQL_HOST -P $MYSQL_PORT < "$SCRIPT_DIR/seed_interview_data_part3.sql"

if [ $? -eq 0 ]; then
    echo "✓ Seed data part 3 loaded successfully"
else
    echo "✗ Failed to load seed data part 3"
    exit 1
fi

echo ""
echo "========================================="
echo "  Database Statistics"
echo "========================================="

# Get statistics
mysql -u $MYSQL_USER -h $MYSQL_HOST -P $MYSQL_PORT -e "
USE interview_db;
SELECT 'Departments' AS table_name, COUNT(*) AS count FROM departments
UNION ALL SELECT 'Job Positions', COUNT(*) FROM job_positions
UNION ALL SELECT 'Candidates', COUNT(*) FROM candidates
UNION ALL SELECT 'Applications', COUNT(*) FROM applications
UNION ALL SELECT 'Interviewers', COUNT(*) FROM interviewers
UNION ALL SELECT 'Interview Rounds', COUNT(*) FROM interview_rounds
UNION ALL SELECT 'Interviews', COUNT(*) FROM interviews
UNION ALL SELECT 'Interview Assignments', COUNT(*) FROM interview_assignments
UNION ALL SELECT 'Interview Feedback', COUNT(*) FROM interview_feedback
UNION ALL SELECT 'Offers', COUNT(*) FROM offers
UNION ALL SELECT 'Background Checks', COUNT(*) FROM background_checks
UNION ALL SELECT 'Activity Logs', COUNT(*) FROM activity_logs;
"

echo ""
echo "========================================="
echo "  Setup Complete!"
echo "========================================="
echo ""
echo "Database: interview_db"
echo "Access: mysql -u $MYSQL_USER interview_db"
echo ""
echo "Sample queries to try:"
echo "  - SELECT * FROM candidates LIMIT 10;"
echo "  - SELECT * FROM applications WHERE status = 'OFFER';"
echo "  - SELECT * FROM interviews WHERE status = 'SCHEDULED';"
echo "  - SELECT * FROM interview_feedback WHERE recommendation = 'STRONG_HIRE';"
echo ""
