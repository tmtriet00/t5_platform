alter role authenticator
set
  pgrst.db_pre_request = 'check_user_ip'