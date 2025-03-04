CREATE TABLE Person (
    person_id int PRIMARY KEY,
    name varchar(100) NOT NULL
);

CREATE TABLE Passport (
    passport_id int PRIMARY KEY,
    person_id int UNIQUE,
    passport_number varchar(50) NOT NULL,
    FOREIGN KEY (person_id) REFERENCES Person(person_id)
);