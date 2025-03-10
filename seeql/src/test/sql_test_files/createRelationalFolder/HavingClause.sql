SELECT customer_id, SUM(amount) AS total_spent
FROM sales
GROUP BY customer_id
HAVING SUM(amount) > 500;