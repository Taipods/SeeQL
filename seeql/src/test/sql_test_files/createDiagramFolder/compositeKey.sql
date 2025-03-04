CREATE TABLE Cars (
    vin VARCHAR(20) PRIMARY KEY,
    model VARCHAR(50)
);

CREATE TABLE CarOwnership (
    vin VARCHAR(20),  -- FK but part of composite PK
    owner_id INT,
    PRIMARY KEY (vin, owner_id),  -- Composite PK
    FOREIGN KEY (vin) REFERENCES Cars(vin)
);