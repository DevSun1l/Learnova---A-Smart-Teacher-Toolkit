import { supabase } from "../integrations/supabase/client";

export type LogAction = 
  | "signed_in" 
  | "signed_out" 
  | "added_student" 
  | "deleted_student" 
  | "blocked_user" 
  | "unblocked_user" 
  | "deleted_user"
  | "promoted_admin";

export const logActivity = async (userId: string, action: LogAction, details: any = {}) => {
  try {
    const { error } = await supabase.from("activity_logs").insert({
      user_id: userId,
      action,
      details
    });
    if (error) console.error("Logging error:", error);
  } catch (err) {
    console.error("Logging failed:", err);
  }
};
