-- Create teams for managers/leads who don't have teams yet
INSERT INTO teams (name, team_leader_id, created_at)
SELECT 
  e.full_name || '''s Team',
  e.id,
  now()
FROM employees e
WHERE (e.position LIKE '%Manager%' OR e.position LIKE '%Lead%')
  AND e.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM teams t WHERE t.team_leader_id = e.id
  );

-- Add team leaders as members of their own teams
INSERT INTO team_members (team_id, employee_id, role, joined_at)
SELECT 
  t.id,
  t.team_leader_id,
  'Team Lead',
  now()
FROM teams t
WHERE NOT EXISTS (
  SELECT 1 FROM team_members tm 
  WHERE tm.team_id = t.id AND tm.employee_id = t.team_leader_id
);

-- Assign random employees to teams (up to 5 per team)
WITH team_assignments AS (
  SELECT 
    t.id as team_id,
    e.id as employee_id,
    ROW_NUMBER() OVER (PARTITION BY t.id ORDER BY RANDOM()) as rn
  FROM teams t
  CROSS JOIN employees e
  WHERE e.status = 'active'
    AND e.id != t.team_leader_id
    AND NOT EXISTS (
      SELECT 1 FROM team_members tm WHERE tm.employee_id = e.id
    )
)
INSERT INTO team_members (team_id, employee_id, role, joined_at)
SELECT team_id, employee_id, 'Team Member', now()
FROM team_assignments
WHERE rn <= 5;