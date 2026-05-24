import { redirect } from "next/navigation";

/** Use this instead of redirect() in admin server actions. */
export function adminRedirect(path: string): never {
  return redirect(path);
}
