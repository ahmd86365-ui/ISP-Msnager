"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

import { signIn } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  try {
    await signIn("credentials", {
      username,
      password,
      redirectTo: "/",
    });
  } catch (error) {
    // signIn() redirects internally on success by throwing a NEXT_REDIRECT
    // error — only intercept actual auth failures here and let anything
    // else (including that redirect) propagate.
    if (error instanceof AuthError) {
      redirect("/login?error=1");
    }
    throw error;
  }
}
