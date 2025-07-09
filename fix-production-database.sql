-- Add missing columns to test_plans table
ALTER TABLE "test_plans" 
ADD COLUMN IF NOT EXISTS "acceptance_criteria" TEXT,
ADD COLUMN IF NOT EXISTS "deliverables" TEXT,
ADD COLUMN IF NOT EXISTS "environment" TEXT,
ADD COLUMN IF NOT EXISTS "objectives" TEXT,
ADD COLUMN IF NOT EXISTS "resources" TEXT,
ADD COLUMN IF NOT EXISTS "risk_management" TEXT,
ADD COLUMN IF NOT EXISTS "schedule" TEXT,
ADD COLUMN IF NOT EXISTS "scope" TEXT,
ADD COLUMN IF NOT EXISTS "test_strategy" TEXT;

-- Verify that the columns were added correctly
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'test_plans' 
AND table_schema = 'public'
AND column_name IN (
    'objectives', 'scope', 'test_strategy', 'environment',
    'acceptance_criteria', 'risk_management', 'resources',
    'schedule', 'deliverables'
)
ORDER BY column_name;