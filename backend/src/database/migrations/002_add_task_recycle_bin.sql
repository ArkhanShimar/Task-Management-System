ALTER TABLE tasks ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL AFTER updated_at, ADD INDEX idx_tasks_deleted_at (deleted_at);
