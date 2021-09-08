SELECT guid,
         "name.title" AS title,
         "name.first_name" AS first_name,
         "name.last_name" AS last_name,
         email,
         "address.line_1",
         "address.line_2",
         "address.country",
         "address.city",
         "address.county",
         "address.postcode",
         "address.state",
         date_format(FROM_UNIXTIME("meta.creation_date"), '%Y-%m-%dT%H:%i:%sZ') AS created,
         date_format(FROM_UNIXTIME("contact.verified_email"), '%Y-%m-%dT%H:%i:%sZ') AS verified,
         IF(CAST("consent.over18" AS boolean),'Yes', 'No') AS is_adult,  
         IF(CAST("consent.additional_samples" AS boolean), 'Yes', 'No') AS additional_samples,
         IF(CAST("consent.offers_and_promotions" AS boolean), 'Yes', 'No') AS offers_and_promotions,
         IF(CAST("consent.share_data_with_third_party" AS boolean), 'Yes', 'No') AS share_data_with_third_party,
         IF(CAST("consent.has_been_given_mature_content_warning" AS boolean), 'Yes', 'No') AS has_been_given_mature_content_warning,
         IF(CAST("consent.terms_conditions" AS boolean), 'Yes', 'No') AS terms_conditions,
         dob
FROM "<%= service %>_<%= stage %>_frontend_user" 
WHERE DATE(FROM_UNIXTIME("meta.creation_date")) >= DATE('<%= yesterday %>')
AND DATE(FROM_UNIXTIME("meta.creation_date")) < DATE('<%= today %>')
OR DATE(FROM_UNIXTIME("updated")) >= DATE('<%= yesterday %>')
AND DATE(FROM_UNIXTIME("updated")) < DATE('<%= today %>')