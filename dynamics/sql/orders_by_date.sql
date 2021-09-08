SELECT orders."guid",
          campaign."name" AS campaign_name,
          campaign."guid" AS campaign_guid,
          date_format(FROM_UNIXTIME(orders."created" / 1000), '%Y-%m-%dT%H:%i:%sZ') AS created,
          orders."platform",
          orders."user" AS user_guid,
          orders."fulfilled",
          orders."display.brand" AS brand_name,
          orders."display.product" AS product_name
FROM "<%= service %>_<%= stage %>_order" AS orders
INNER JOIN "<%= service %>_<%= stage %>_campaign" AS campaign ON campaign."guid"=orders."campaign"
WHERE DATE(from_unixtime(orders."created" / 1000)) >= DATE('<%= yesterday %>')
AND DATE(from_unixtime(orders."created" / 1000)) < DATE('<%= today %>')