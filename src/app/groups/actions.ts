"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseService } from "@/lib/supabase/service";

export type FormState = { error?: string; success?: string } | undefined;

export async function createGroup(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!name) return { error: "Group name is required." };

  const { error } = await supabaseService()
    .from("groups")
    .insert({ name, description: description || null });

  if (error) {
    if (error.code === "23505") {
      return { error: "A group with that name already exists." };
    }
    return { error: error.message };
  }

  revalidatePath("/groups");
  return { success: `Created "${name}".` };
}

export async function deleteGroup(id: string) {
  await supabaseService().from("groups").delete().eq("id", id);
  revalidatePath("/groups");
  redirect("/groups");
}

export async function updateGroupDetails(id: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!name) return;

  await supabaseService()
    .from("groups")
    .update({ name, description: description || null })
    .eq("id", id);

  revalidatePath("/groups");
  revalidatePath(`/groups/${id}`);
}

export async function setGroupMembers(id: string, formData: FormData) {
  const contactIds = formData.getAll("contact_ids").map(String);

  const supabase = supabaseService();
  await supabase.from("group_members").delete().eq("group_id", id);

  if (contactIds.length > 0) {
    await supabase
      .from("group_members")
      .insert(contactIds.map((contact_id) => ({ group_id: id, contact_id })));
  }

  revalidatePath("/groups");
  revalidatePath(`/groups/${id}`);
}
