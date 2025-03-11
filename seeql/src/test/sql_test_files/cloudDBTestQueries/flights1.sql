SELECT DISTINCT flight_num
FROM FLIGHTS F
JOIN CARRIERS C ON F.carrier_id = C.cid
JOIN WEEKDAYS W ON F.day_of_week_id = W.did
WHERE origin_city = 'Seattle WA'
  AND dest_city = 'Boston MA'
  AND name = 'Alaska Airlines Inc.'
  AND day_of_week = 'Monday';