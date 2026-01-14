-- Create the strict checking function
create or replace function check_user_ip () returns void as $$
declare
  client_ip text;
  request_role text;
begin
  -- BYPASS IF SERVICE_ROLE
  select (auth.jwt() ->> 'role') into request_role;
  if request_role = 'service_role' then
    return; 
  end if;

  -- Get the IP from the HTTP header (Supabase passes this from Cloudflare)
  select current_setting('request.headers', true)::json->>'cf-connecting-ip' into client_ip;

  -- If it's an internal request or direct DB connection, skip check
  if client_ip is null then 
    return; 
  end if;

  -- Check if IP is allowed
  if not exists (select 1 from allowed_ips where ip = client_ip::inet) then
    raise exception 'check_user_ip: Access Denied: IP % is not allowed', client_ip;
  end if;
end;
$$ language plpgsql