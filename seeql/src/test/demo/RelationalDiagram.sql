SELECT SP.Tag, COUNT(S.ID) AS C
FROM STUDENTS AS S
JOIN ATHLETES AS A ON S.ID = A.ID
LEFT OUTER JOIN SPORTS AS SP ON SP.Sport = S.Sport
WHERE S.Age >= 18
GROUP BY SP.Tag
HAVING COUNT(S.ID) > 5;