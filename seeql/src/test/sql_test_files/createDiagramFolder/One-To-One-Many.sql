CREATE TABLE Parent (
    id int PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE OneToOne_A (
    id int PRIMARY KEY,
    parent_id INT UNIQUE,  -- One-to-one with Parent
    data VARCHAR(100),
    FOREIGN KEY (parent_id) REFERENCES Parent(id)
);

CREATE TABLE OneToOne_B (
    id int PRIMARY KEY,
    parent_id INT UNIQUE,  -- One-to-one with Parent
    data VARCHAR(100),
    FOREIGN KEY (parent_id) REFERENCES Parent(id)
);

CREATE TABLE ManyToOne_A (
    id int PRIMARY KEY,
    parent_id INT,  -- Many-to-one with Parent
    data VARCHAR(100),
    FOREIGN KEY (parent_id) REFERENCES Parent(id)
);

CREATE TABLE ManyToOne_B (
    id int PRIMARY KEY,
    parent_id INT,  -- Many-to-one with Parent
    data VARCHAR(100),
    FOREIGN KEY (parent_id) REFERENCES Parent(id)
);