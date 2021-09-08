SELECT marketing."guid" AS "",
         marketing."consent" AS "",
         brand."name" AS "",
         marketing."user" AS ""
FROM "<%= service %>_<%= stage %>_marketing_permission" AS marketing
INNER JOIN "<%= service %>_<%= stage %>_brand" AS brand ON brand."guid"=marketing."brand"
WHERE DATE(from_unixtime(marketing."time")) >= DATE('<%= yesterday %>')
AND DATE(from_unixtime(marketing."time")) < DATE('<%= today %>')

-- SELECT marketing."guid",
--          marketing."consent",
--          brand."name" AS brand_name,
--          marketing."user" AS user_guid
-- FROM "<%= service %>_<%= stage %>_marketing_permission" AS marketing
-- INNER JOIN "<%= service %>_<%= stage %>_brand" AS brand ON brand."guid"=marketing."brand"
-- WHERE DATE(from_unixtime(marketing."time")) >= DATE('<%= yesterday %>')
-- AND DATE(from_unixtime(marketing."time")) < DATE('<%= today %>')