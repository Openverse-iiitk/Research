-- Add outcome column to projects table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'projects' 
        AND column_name = 'outcome'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE projects ADD COLUMN outcome TEXT;
    END IF;
END $$;
