SELECT customers.name, orders.order_id, orders.order_date
FROM customers
RIGHT OUTER JOIN orders ON customers.customer_id = orders.customer_id;