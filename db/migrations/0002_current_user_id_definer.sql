-- Signed-in requests failed with "permission denied for schema auth".
--
-- Neon owns the auth schema. The owner of this database can use it but cannot
-- grant it to authenticated, so the identity helper has to run as its owner.
-- It takes no input and returns only the identity from the caller's own
-- verified JWT.

BEGIN;

ALTER FUNCTION app_private.current_user_id() SECURITY DEFINER;

COMMIT;
