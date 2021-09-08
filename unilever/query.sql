SELECT u."email",
       u."name.title",
       u."name.first_name",
       u."name.last_name",
       u."dob",
       IF(CAST(u."consent.over18" AS boolean), true, false) AS over_18,
       (CASE u."name.title"
        WHEN 'Mr' THEN 'M'
        WHEN 'Mrs' THEN 'F'
        WHEN 'Ms' THEN 'F'
        WHEN 'Miss' THEN 'F'
        ELSE 'O' END) AS gender, 
       o."address", 
       o."display.brand", 
       o."display.product", 
       o."platform", 
       c."schedule.from" AS start_on, 
       c."schedule.to" AS end_on,
       IF(CAST(m.consent AS boolean), true, false) AS consent
FROM sendmeasample_blue_production_order o
LEFT JOIN 
    (SELECT *
    FROM sendmeasample_blue_production_marketing_permission
    WHERE brand = '<%= brandGuid %>') AS m
    ON o.user = m.user
JOIN sendmeasample_blue_production_frontend_user AS u ON o.user = u.guid
JOIN sendmeasample_blue_production_campaign c ON c.guid = o.campaign
WHERE o."display.brand"='<%= brandDisplayName %>'
AND o."display.product"='<%= productDisplayName %>'
AND DATE(from_unixtime(o."created" / 1000)) >= DATE('<%= yesterday %>')
AND DATE(from_unixtime(o."created" / 1000)) < DATE('<%= today %>')