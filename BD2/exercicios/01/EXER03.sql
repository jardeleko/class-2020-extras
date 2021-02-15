CREATE OR REPLACE FUNCTION delete_ciel() RETURNS VOID AS $$
DECLARE rows record; middle float;
BEGIN 
    select avg (salary) into middle from employee;
    for rows IN SELECT * FROM datas 
        LOOP
            IF rows.salary > middle THEN 
                DELETE FROM employee WHERE id = rows.id;
            END IF;
        END LOOP;
END;
$$ LANGUAGE plpgsql;