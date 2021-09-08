SELECT "guid" AS "",
          "name.title" AS "",
          "name.first_name" AS "",
          "name.last_name" AS "",
          "email" AS "",
          "address.line_1" AS "",
          "address.line_2" AS "",
          "address.country" AS "",
          "address.city" AS "",
          "address.county" AS "",
          "address.postcode" AS "",
          "address.state" AS "",
          date_format(FROM_UNIXTIME("meta.creation_date"), '%Y-%m-%dT%H:%i:%sZ') AS "",
          date_format(FROM_UNIXTIME("contact.verified_email"), '%Y-%m-%dT%H:%i:%sZ') AS "",
          IF(CAST("consent.over18" AS boolean),'Yes', 'No') AS "",  
          IF(CAST("consent.additional_samples" AS boolean), 'Yes', 'No') AS "",
          IF(CAST("consent.offers_and_promotions" AS boolean), 'Yes', 'No') AS "",
          IF(CAST("consent.share_data_with_third_party" AS boolean), 'Yes', 'No') AS "",
          IF(CAST("consent.has_been_given_mature_content_warning" AS boolean), 'Yes', 'No') AS "",
          IF(CAST("consent.terms_conditions" AS boolean), 'Yes', 'No') AS "",
          IF(CAST("consent.categories.alcohol" AS boolean),'Yes', 'No') AS "",  
          IF(CAST("consent.categories.foodDrink" AS boolean), 'Yes', 'No') AS "",
          IF(CAST("consent.categories.healthBeauty" AS boolean), 'Yes', 'No') AS "",
          IF(CAST("consent.categories.household" AS boolean), 'Yes', 'No') AS "",
          IF(CAST("consent.categories.newsMagazines" AS boolean), 'Yes', 'No') AS "",
          IF(CAST("consent.categories.petcare" AS boolean), 'Yes', 'No') AS "",
          "dob" AS ""
FROM "<%= service %>_<%= stage %>_frontend_user"
WHERE DATE(FROM_UNIXTIME("meta.creation_date")) >= DATE('<%= yesterday %>')
AND DATE(FROM_UNIXTIME("meta.creation_date")) < DATE('<%= today %>')
OR DATE(FROM_UNIXTIME("updated")) >= DATE('<%= yesterday %>')
AND DATE(FROM_UNIXTIME("updated")) < DATE('<%= today %>')


-- SELECT guid,
--           "name.title" AS title,
--           "name.first_name" AS first_name,
--           "name.last_name" AS last_name,
--           email,
--           "address.line_1",
--           "address.line_2",
--           "address.country",
--           "address.city",
--           "address.county",
--           "address.postcode",
--           "address.state",
--           date_format(FROM_UNIXTIME("meta.creation_date"), '%Y-%m-%dT%H:%i:%sZ') AS created,
--           date_format(FROM_UNIXTIME("contact.verified_email"), '%Y-%m-%dT%H:%i:%sZ') AS verified,
--           IF(CAST("consent.over18" AS boolean),'Yes', 'No') AS is_adult,  
--           IF(CAST("consent.additional_samples" AS boolean), 'Yes', 'No') AS additional_samples,
--           IF(CAST("consent.offers_and_promotions" AS boolean), 'Yes', 'No') AS offers_and_promotions,
--           IF(CAST("consent.share_data_with_third_party" AS boolean), 'Yes', 'No') AS share_data_with_third_party,
--           IF(CAST("consent.has_been_given_mature_content_warning" AS boolean), 'Yes', 'No') AS has_been_given_mature_content_warning,
--           IF(CAST("consent.terms_conditions" AS boolean), 'Yes', 'No') AS terms_conditions,
--           IF(CAST("consent.categories.alcohol" AS boolean),'Yes', 'No') AS alcohol,  
--           IF(CAST("consent.categories.foodDrink" AS boolean), 'Yes', 'No') AS foodDrink,
--           IF(CAST("consent.categories.healthBeauty" AS boolean), 'Yes', 'No') AS healthBeauty,
--           IF(CAST("consent.categories.household" AS boolean), 'Yes', 'No') AS household,
--           IF(CAST("consent.categories.newsMagazines" AS boolean), 'Yes', 'No') AS newsMagazines,
--           IF(CAST("consent.categories.petcare" AS boolean), 'Yes', 'No') AS petcare,
--           dob
-- FROM "<%= service %>_<%= stage %>_frontend_user"
-- WHERE DATE(FROM_UNIXTIME("meta.creation_date")) >= DATE('<%= yesterday %>')
-- AND DATE(FROM_UNIXTIME("meta.creation_date")) < DATE('<%= today %>')
-- OR DATE(FROM_UNIXTIME("updated")) >= DATE('<%= yesterday %>')
-- AND DATE(FROM_UNIXTIME("updated")) < DATE('<%= today %>')