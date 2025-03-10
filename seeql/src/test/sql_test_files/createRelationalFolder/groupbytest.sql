SELECT customer_id, SUM(amount) AS total_sales
FROM sales
GROUP BY customer_id;