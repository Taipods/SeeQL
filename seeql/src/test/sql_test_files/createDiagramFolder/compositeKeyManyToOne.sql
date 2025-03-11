CREATE TABLE Cars (
    vin VARCHAR(20) PRIMARY KEY,
    model VARCHAR(50)
);

CREATE TABLE CarOwnership (
    vin VARCHAR(20),
    owner_id INT,
    PRIMARY KEY (vin, owner_id), 
    FOREIGN KEY (vin) REFERENCES Cars(vin)
);