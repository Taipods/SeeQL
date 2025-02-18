CREATE TABLE Users (
    uid int primary KEY,
    email varchar(200),
    nickname varchar(20),
    street varchar(20),
    city varchar(20),
    state varchar(20),
    address varchar(20),
    zip int,
    genres VARCHAR(20),
    joined_date DATE
);

CREATE TABLE Producers (
    producer_id int primary KEY references Users(uid),
    company int,
    bio int
);

CREATE TABLE Viewers (
    viewer_id int primary KEY references Users(uid),
    name VARCHAR(255),
    firstname VARCHAR(255),
    lastname VARCHAR(255)
);

