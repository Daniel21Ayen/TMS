"use server";
import { setStock as set } from "./create-offer.action";
export async function setStock(id: string, formData: FormData) { return set(id, formData); }
