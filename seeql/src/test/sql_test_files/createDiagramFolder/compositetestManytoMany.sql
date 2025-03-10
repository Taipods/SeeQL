CREATE TABLE Employees (
    employee_id INT PRIMARY KEY,
    name VARCHAR(100)
);

CREATE TABLE Projects (
    project_id INT PRIMARY KEY,
    name VARCHAR(100)
);

CREATE TABLE EmployeeProjects (
    employee_id INT,
    project_id INT,
    role VARCHAR(50),
    PRIMARY KEY (employee_id, project_id),
    FOREIGN KEY (employee_id) REFERENCES Employees(employee_id),
    FOREIGN KEY (project_id) REFERENCES Projects(project_id)
);