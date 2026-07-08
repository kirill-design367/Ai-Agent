import type { Metadata } from "next";
import LegalPage, { LEGAL_TITLES } from "@/components/LegalPage";
export const metadata: Metadata = { title: `${LEGAL_TITLES.policy} — AUREA`, robots: { index: true } };
export default function Page() { return <LegalPage slug="policy" />; }
