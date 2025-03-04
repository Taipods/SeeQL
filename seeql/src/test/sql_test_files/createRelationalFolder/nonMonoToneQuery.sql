SELECT p.id 
FROM parent p
WHERE p.id NOT IN (SELECT c.parent_id FROM child c);
-- Limitations