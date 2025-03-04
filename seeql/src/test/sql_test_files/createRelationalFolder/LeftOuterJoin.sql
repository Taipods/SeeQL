SELECT p.id AS parent_id, 
       c.child_code, 
       c.parent_id 
FROM parent p
LEFT OUTER JOIN child c ON p.id = c.parent_id;