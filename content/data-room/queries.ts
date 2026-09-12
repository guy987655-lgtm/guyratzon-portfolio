/**
 * The three data-room queries. SQL is shown verbatim on the page (identical in both languages);
 * results come from running it against SpeCV's synthetic warehouse (scripts/data-room/run-queries.ts)
 * and are committed as results.json — the page never touches a database.
 */
export const dataRoomQueries = [
  {
    id: "uploads-before-signup",
    sql: `select d.month_start_date                                             as month,
       count(*) filter (where s.is_first_for_visitor_jd)                 as jobs_uploaded,
       count(*) filter (where s.is_first_for_visitor_jd
                          and s.is_anonymous)                            as before_signup,
       round(100.0 * count(*) filter (where s.is_first_for_visitor_jd
                                        and s.is_anonymous)
             / nullif(count(*) filter (where s.is_first_for_visitor_jd), 0), 1)
                                                                         as pct_before_signup
from analytics.fact_jd_submission s
join analytics.dim_date d using (date_key)
group by d.month_start_date
order by month desc
limit 6;`,
  },
  {
    id: "signup-by-source",
    sql: `select a.referrer_type                                             as source,
       count(*)                                                    as visits,
       count(*) filter (where v.jd_submitted_count > 0)            as pasted_a_job,
       count(*) filter (where v.converted_to_signup)               as signed_up,
       round(100.0 * count(*) filter (where v.converted_to_signup)
             / count(*), 1)                                        as signup_rate_pct
from analytics.fact_visit v
join analytics.dim_acquisition a using (acquisition_key)
where not v.bot_suspect
group by a.referrer_type
order by visits desc;`,
  },
  {
    id: "roles-and-companies",
    sql: `with per_company as (
  select r.role_family, c.company_key, c.raw_variant_count,
         count(*) filter (where s.is_first_for_visitor_jd) as jobs
  from analytics.fact_jd_submission s
  join analytics.dim_role    r using (role_key)
  join analytics.dim_company c using (company_key)
  where s.role_key <> -1 and s.company_key <> -1
  group by r.role_family, c.company_key, c.raw_variant_count
)
select role_family,
       sum(jobs)              as jobs_uploaded,
       count(*)               as companies,
       sum(raw_variant_count) as spellings_seen
from per_company
group by role_family
order by jobs_uploaded desc
limit 6;`,
  },
] as const;

export type DataRoomQueryId = (typeof dataRoomQueries)[number]["id"];
