CREATE TABLE Projects (
    project_id INT PRIMARY KEY,
    project_name VARCHAR(255),
    lead_id INT,
    reviewer_id INT,
    FOREIGN KEY (lead_id) REFERENCES Employees(employee_id),
    FOREIGN KEY (reviewer_id) REFERENCES Employees(employee_id)
);

CREATE TABLE Employees (
    employee_id INT PRIMARY KEY,
    name VARCHAR(100),
    position VARCHAR(100),
    department VARCHAR(100),
    email VARCHAR(255)
)