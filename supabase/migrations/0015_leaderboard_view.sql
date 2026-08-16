-- 1. Create a view to aggregate college medals and points
-- Points scale: 1st=10, 2nd=8, 3rd=6, 4th=5, 5th=4, 6th=3, 7th=2, 8th=1
CREATE OR REPLACE VIEW college_leaderboard AS
WITH ranked_results AS (
    SELECT 
        p.college_name,
        r.rank,
        r.event_id,
        er.round_type
    FROM event_results r
    JOIN profiles p ON r.profile_id = p.id
    JOIN event_rounds er ON r.round_id = er.id
    WHERE er.round_type = 'final' AND r.rank IS NOT NULL
)
SELECT 
    college_name,
    COUNT(CASE WHEN rank = 1 THEN 1 END) as gold_medals,
    COUNT(CASE WHEN rank = 2 THEN 1 END) as silver_medals,
    COUNT(CASE WHEN rank = 3 THEN 1 END) as bronze_medals,
    SUM(
        CASE rank
            WHEN 1 THEN 10
            WHEN 2 THEN 8
            WHEN 3 THEN 6
            WHEN 4 THEN 5
            WHEN 5 THEN 4
            WHEN 6 THEN 3
            WHEN 7 THEN 2
            WHEN 8 THEN 1
            ELSE 0
        END
    ) as total_points
FROM ranked_results
GROUP BY college_name;

-- Note: No RLS needed for views if they pull from tables with RLS and the view runs with invoker privileges,
-- but standard behavior is definer bypass. Since we want this public, it's fine.
