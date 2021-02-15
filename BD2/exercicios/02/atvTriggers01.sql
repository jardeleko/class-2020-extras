CREATE TABLE AvailableFlights(Num_flight in, date date, numberOfFreeSeats int, price float);
CREATE TABLE Bookings(Num_flight int, date date, passenger int, price float);

create or replace function releaseflights() returns trigger as $$
declare numb int; otprice float; pass int;
begin 
    select avg(NEW.price) into otprice from AvailableFlights;
    select avg(NEW.numberOfFreeSeats) into pass from AvailableFlights;
    pass := pass-1; 
    otprice := otprice+50;
    if (TG_OP='INSERT') then
        insert into Bookings values(new.Num_flights, now(), pass, otprice); -- minha var ficou num_flights
        return new;
    elsif(new.numberOfFreeSeats < 1) then 
        raise exception 'Numero de tickets inferior ou inexistente'; 
    end if;
    return null; 
end;
$$ language plpgsql;

create trigger releaseflights after insert or update or delete on AvailableFlights
for each row execute procedure releaseflights();
