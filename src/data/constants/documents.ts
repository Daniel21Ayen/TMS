export const DOC_LABEL = { LICENSE: "Driving license", ID_CARD: "National / Kebele ID", VEHICLE_REGISTRATION: "Vehicle registration (Libre)", BUSINESS_LICENSE: "Business license" } as const;
export type DocKind = keyof typeof DOC_LABEL;
export const REQUIRED: Record<string, DocKind[]> = { DRIVER: ["LICENSE", "ID_CARD", "VEHICLE_REGISTRATION"], VENDOR: ["BUSINESS_LICENSE", "ID_CARD"] };
