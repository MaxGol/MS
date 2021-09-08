SELECT campaign."guid",
         DATE(from_unixtime(campaign."created" / 1000)) AS created,
         DATE(from_unixtime(campaign."schedule.from" / 1000)) AS start_on,
         DATE(from_unixtime(campaign."schedule.to" / 1000)) AS end_on,
         campaign."name",
         campaign."approval",
         campaign."archived",
         brand."name" AS brand_name,
         company."name" AS company_name,
         campaign."market",
         campaign."marketing",
         campaign."paused",
         COUNT(orders."guid") AS order_count
FROM "<%= service %>_<%= stage %>_campaign" AS campaign
INNER JOIN "<%= service %>_<%= stage %>_brand" AS brand
    ON brand."guid"=campaign."brand"
INNER JOIN "<%= service %>_<%= stage %>_company" AS company
    ON company."guid"=campaign."company"
LEFT JOIN "<%= service %>_<%= stage %>_order" AS orders
    ON orders."campaign"=campaign."guid"
WHERE DATE(from_unixtime(campaign."created" / 1000)) >= DATE('<%= yesterday %>')
AND DATE(from_unixtime(campaign."created" / 1000)) < DATE('<%= today %>')
GROUP BY  (campaign."guid", campaign."created", campaign."schedule.from", campaign."schedule.to", campaign."name",campaign."approval", campaign."market", campaign."marketing", campaign."paused", campaign."archived", brand."name", company."name", brand."name")