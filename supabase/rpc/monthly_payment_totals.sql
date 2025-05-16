-- Function to get monthly payment totals for the last 12 months
CREATE OR REPLACE FUNCTION get_monthly_payment_totals()
RETURNS TABLE (
  month TEXT,
  total DECIMAL
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH months AS (
    SELECT
      to_char(date_trunc('month', d), 'YYYY-MM') as month
    FROM
      generate_series(
        date_trunc('month', current_date - interval '11 months'),
        date_trunc('month', current_date),
        interval '1 month'
      ) d
  ),
  payment_totals AS (
    SELECT
      to_char(date_trunc('month', payment_date), 'YYYY-MM') as month,
      sum(amount) as total
    FROM
      payments
    WHERE
      payment_date >= date_trunc('month', current_date - interval '11 months')
      AND status = 'completed'
    GROUP BY
      to_char(date_trunc('month', payment_date), 'YYYY-MM')
  )
  SELECT
    m.month,
    COALESCE(pt.total, 0) as total
  FROM
    months m
  LEFT JOIN
    payment_totals pt ON m.month = pt.month
  ORDER BY
    m.month;
END;
$$; 