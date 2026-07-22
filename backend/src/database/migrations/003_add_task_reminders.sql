ALTER TABLE tasks
  ADD COLUMN reminder_days_before TINYINT UNSIGNED NULL DEFAULT 1 AFTER due_date,
  ADD INDEX idx_tasks_reminder (user_id, reminder_days_before, due_date);
