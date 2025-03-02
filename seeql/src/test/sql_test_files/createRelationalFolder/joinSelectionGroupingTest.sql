SELECT c.customer_id, c.customer_name, SUM(o.total_amount) AS total_spent
FROM Customers c
JOIN Orders o ON c.customer_id = o.customer_id  -- Join
WHERE o.order_date >= '2024-01-01'              -- Selection
GROUP BY c.customer_id, c.customer_name         -- Grouping