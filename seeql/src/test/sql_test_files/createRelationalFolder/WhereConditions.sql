SELECT name, category, price
FROM products
WHERE category = 'Electronics' 
AND price > 100 
AND stock_quantity > 0;