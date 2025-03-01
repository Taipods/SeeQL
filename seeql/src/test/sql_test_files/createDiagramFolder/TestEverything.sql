-- Many-to-One: Manufacturer and Cycle
CREATE TABLE Manufacturer (
    manufacturer_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE Cycle (
    cycle_id INT PRIMARY KEY,
    manufacturer_id INT,
    model VARCHAR(100),
    FOREIGN KEY (manufacturer_id) REFERENCES Manufacturer(manufacturer_id)
);

-- One-to-One: Each Cycle has one unique detail record.
CREATE TABLE CycleDetail (
    cycle_id INT PRIMARY KEY,
    color VARCHAR(50),
    engine_number VARCHAR(100),
    FOREIGN KEY (cycle_id) REFERENCES Cycle(cycle_id)
);

-- Many-to-Many: Cycle and Rider through a join table.
CREATE TABLE Rider (
    rider_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE CycleRider (
    cycle_id INT,
    rider_id INT,
    PRIMARY KEY (cycle_id, rider_id),
    FOREIGN KEY (cycle_id) REFERENCES Cycle(cycle_id),
    FOREIGN KEY (rider_id) REFERENCES Rider(rider_id)
);