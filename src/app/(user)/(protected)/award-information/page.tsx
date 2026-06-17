import { AwardInfoSection } from "@/components/award-information/award-info-section";
import { AwardTitleBand } from "@/components/award-information/award-title-band";
import { KudosSection } from "@/components/homepage/kudos-section";

/**
 * /award-information — protected "Hệ thống giải thưởng SAA 2025" page.
 *
 * Auth guard, shared header + footer live in the (protected) layout. This page
 * owns the body: keyvisual title band → sidebar + 6 award detail blocks →
 * reused Sun* Kudos banner (shared with /home).
 */
export default function AwardInformationPage() {
  return (
    <>
      <AwardTitleBand />
      <AwardInfoSection />
      <KudosSection />
    </>
  );
}
