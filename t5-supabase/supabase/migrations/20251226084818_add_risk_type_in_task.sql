CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high');
ALTER TABLE tasks ADD COLUMN risk_type risk_level;