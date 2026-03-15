-- Reassign priorities to be per-status: for each (project_id, status_id), assign 0,1,2... by current priority
WITH ranked AS (
  SELECT id, project_id, status_id,
    ROW_NUMBER() OVER (PARTITION BY project_id, status_id ORDER BY priority ASC, created_at DESC) - 1 AS new_priority
  FROM issues
)
UPDATE issues i
SET priority = r.new_priority
FROM ranked r
WHERE i.id = r.id;
