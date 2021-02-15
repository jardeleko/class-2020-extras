CREATE OR REPLACE FUNCTION inc_params(x float, n integer) RETURNS VOID AS $$
DECLARE rows record;
BEGIN
for rows IN SELECT * FROM employee 
    LOOP
        IF rows.salary > n THEN
            UPDATE employee SET salary = rows.salary * x WHERE id = rows.id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
