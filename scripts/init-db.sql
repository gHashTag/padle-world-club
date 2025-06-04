-- Database initialization script for Padel World Club API
-- This script runs when PostgreSQL container starts for the first time

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis" SCHEMA public;

-- Create test database for testing
CREATE DATABASE padel_test_db;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE padel_db TO padel_user;
GRANT ALL PRIVILEGES ON DATABASE padel_test_db TO padel_user;

-- Connect to main database
\c padel_db;

-- Grant schema permissions
GRANT ALL ON SCHEMA public TO padel_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO padel_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO padel_user;

-- Connect to test database
\c padel_test_db;

-- Grant schema permissions for test database
GRANT ALL ON SCHEMA public TO padel_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO padel_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO padel_user;
