SELECT marketing."guid",
         marketing."consent",
         brand."name" AS brand_name,
         marketing."user" AS user_guid
FROM "<%= service %>_<%= stage %>_marketing_permission" AS marketing
INNER JOIN "<%= service %>_<%= stage %>_brand" AS brand ON brand."guid"=marketing."brand"