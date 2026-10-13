export const PAYMENT_METHODS = [{ value: "TELEBIRR", label: "Telebirr" }, { value: "CBE_BIRR", label: "CBE Birr" }, { value: "BANK", label: "Bank Transfer" }, { value: "CHAPA", label: "Chapa" }] as const;
export const methodLabel = (v: string) => PAYMENT_METHODS.find((m) => m.value === v)?.label ?? v;
