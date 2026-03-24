-- Migration: add multilingual description columns to cars table
ALTER TABLE cars
  ADD COLUMN IF NOT EXISTS description_en TEXT,
  ADD COLUMN IF NOT EXISTS description_ru TEXT,
  ADD COLUMN IF NOT EXISTS description_kk TEXT,
  ADD COLUMN IF NOT EXISTS description_zh TEXT;

-- Optional: If you want to migrate existing `description` into `description_en` by default
UPDATE cars SET description_en = description WHERE description_en IS NULL AND description IS NOT NULL;
