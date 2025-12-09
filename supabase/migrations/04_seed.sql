-- Fix Function Search Path Mutable warning for update_game_score_updated_at
CREATE OR REPLACE FUNCTION public.update_game_score_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;