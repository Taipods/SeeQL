CREATE TABLE parent (
    id INT PRIMARY KEY
);

CREATE TABLE child (
    parent_id INT,
    child_code VARCHAR(10),
    PRIMARY KEY (parent_id, child_code),
    FOREIGN KEY (parent_id) REFERENCES parent(id)
);