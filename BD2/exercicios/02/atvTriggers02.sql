CREATE TABLE PageRevision(name varchar, date date, author varchar , text text);
CREATE TABLE Pageaudit(op varchar(1), name varchar(50), date date, auth varchar(30), content text);

create or replace function log() returns trigger as $$
begin 
    if(TG_OP='DELETE') then
        insert into pageaudit values('D', new.name, now(), new.author, new.text);
        return OLD;
    elsif(TG_OP='UPDATE') then
        insert into pageaudit select 'U', new.name, now(), new.author, new.text;
        return new;
    elsif(TG_OP='INSERT') then
        insert into pageaudit values('I', new.name, now(), new.author, new.text);
        return new;
    end if;
    return null; --essas funções são muito validas (y), bom fds!
end;
$$ language plpgsql;

create trigger logs after insert or update or delete on PageRevision
for each row execute procedure logs();
