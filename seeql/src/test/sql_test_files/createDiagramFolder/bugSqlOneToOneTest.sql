CREATE TABLE Employees (
    id INT PRIMARY KEY,
    name VARCHAR(100)
);

CREATE TABLE EmployeeDetails (
    emp_id INT PRIMARY KEY,  -- Also a PK, but...
    department VARCHAR(50),
    FOREIGN KEY (emp_id) REFERENCES Employees(id)
);