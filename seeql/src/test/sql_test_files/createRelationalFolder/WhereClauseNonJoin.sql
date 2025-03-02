SELECT name, department, salary
FROM employees
WHERE salary > 50000 
AND department != 'HR' 
AND hire_date BETWEEN '2020-01-01' AND '2024-12-31';

--Limitation on nonjoins