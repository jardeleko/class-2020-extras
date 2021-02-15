CREATE OR REPLACE FUNCTION emp_time() 
RETURNS trigger AS $$

    BEGIN   
     
        IF NEW.empname IS NULL THEN
            RAISE EXCEPTION 'empname nao pode ser nulo';
        END IF;        
        IF NEW.salary IS NULL THEN
            RAISE EXCEPTION 'nao pode ter salario nulo';
        END IF;
        
        NEW.salary = NEW.salary + (NEW.salary*0.1); 
        NEW.last_date := current_date;
        NEW.last_user := current_user;
        RETURN NEW;
        
    END;
$$ LANGUAGE plpgsql;