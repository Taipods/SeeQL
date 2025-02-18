CREATE TABLE Nations(
    nation_ID int PRIMARY KEY,
    nation_name varchar(255),
    total_population int,
);

CREATE TABLE People(
    person_ID int PRIMARY KEY,
    surname varchar(255),
    given_name varchar(255),
    residence varchar(255),
    town_ID int,
    nation_ID int, 
    FOREIGN KEY (town_ID) REFERENCES Towns(town_ID),
    FOREIGN KEY (nation_ID) REFERENCES Nations(nation_ID) 
);

CREATE TABLE Towns(
    town_ID int PRIMARY KEY,
    town_name varchar(255),
    nation_ID int,
    town_population int,
    FOREIGN KEY (nation_ID) REFERENCES Nations(nation_ID)
);