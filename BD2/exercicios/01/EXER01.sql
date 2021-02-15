CREATE OR REPLACE FUNCTION incr() RETURNS VOID AS $$
DECLARE rows record;
BEGIN
    for rows IN SELECT * FROM datas 
        LOOP
            UPDATE datas SET salario = rows.salario * 1.1 WHERE id = rows.id;
        END LOOP;
END;
$$ LANGUAGE plpgsql;