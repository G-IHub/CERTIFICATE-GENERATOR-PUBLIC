import CertificateTemplate1 from "./templates/CertificateTemplate1";
import CertificateTemplate2 from "./templates/CertificateTemplate2";
import CertificateTemplate3 from "./templates/CertificateTemplate3";
import CertificateTemplate4 from "./templates/CertificateTemplate4";
import CertificateTemplate5 from "./templates/CertificateTemplate5";
import CertificateTemplate6 from "./templates/CertificateTemplate6";
import CertificateTemplate7 from "./templates/CertificateTemplate7";
import CertificateTemplate8 from "./templates/CertificateTemplate8";
import CertificateTemplate9 from "./templates/CertificateTemplate9";
import CertificateTemplate10 from "./templates/CertificateTemplate10";
import CertificateTemplate11 from "./templates/CertficateTemplate11";
import CertificateTemplate12 from "./templates/CertificateTemplate12";
import CertificateTemplate13 from "./templates/CertificateTemplate13";
import CertificateTemplate14 from "./templates/CertificateTemplate14";
import CertificateTemplate15 from "./templates/CertificateTemplate15";
import CertificateTemplate16 from "./templates/CertificateTemplate16";
import CertificateTemplate17 from "./templates/CertificateTemplate17";
import CertificateTemplate18 from "./templates/CertificateTemplate18";
import CertificateTemplate19 from "./templates/CertificateTemplate19";
import CertificateTemplate20 from "./templates/CertificateTemplate20";
import CertificateTemplate21 from "./templates/CertificateTemplate21";
import CertificateTemplate22 from "./templates/CertificateTemplate22";
import CertificateTemplate23 from "./templates/CertificateTemplate23";
import CertificateTemplate24 from "./templates/CertificateTemplate24";
import CertificateTemplate25 from "./templates/CertificateTemplate25";
import CertificateTemplate26 from "./templates/CertificateTemplate26";
import CertificateTemplate27 from "./templates/CertificateTemplate27";
import CertificateTemplate28 from "./templates/CertificateTemplate28";
import CertificateTemplate29 from "./templates/CertificateTemplate29";
import CertificateTemplate30 from "./templates/CertificateTemplate30";
import CertificateTemplate31 from "./templates/CertificateTemplate31";
import CertificateTemplate32 from "./templates/CertificateTemplate32";
import CertificateTemplate33 from "./templates/CertificateTemplate33";
import CertificateTemplate34 from "./templates/CertificateTemplate34";
import CertificateTemplate35 from "./templates/CertificateTemplate35";
import CertificateTemplate36 from "./templates/CertificateTemplate36";
import CertificateTemplate37 from "./templates/CertificateTemplate37";
import CertificateTemplate38 from "./templates/CertificateTemplate38";
import CertificateTemplate39 from "./templates/CertificateTemplate39";
import type { Logo } from "../App";

interface CertificateRendererProps {
  templateId: string;
  header: string;
  courseTitle: string;
  description?: string;
  date: string;
  recipientName: string;
  isPreview?: boolean;
  mode?: "student" | "template-selection";
  organizationName?: string;
  organizationLogo?: string;
  organizationLogos?: Logo[]; // NEW: Organization logos array
  signatoryName1?: string;
  signatoryTitle1?: string;
  signatureUrl1?: string;
  signatoryName2?: string;
  signatoryTitle2?: string;
  signatureUrl2?: string;
  certificateId?: string;
}

export default function CertificateRenderer({
  templateId,
  header,
  courseTitle,
  description,
  date,
  recipientName,
  isPreview = false,
  mode = "student",
  organizationName,
  organizationLogo,
  organizationLogos,
  signatoryName1,
  signatoryTitle1,
  signatureUrl1,
  signatoryName2,
  signatoryTitle2,
  signatureUrl2,
  certificateId,
}: CertificateRendererProps) {
  const templateProps = {
    header,
    courseTitle,
    description,
    date,
    recipientName,
    isPreview,
    mode,
    organizationName,
    organizationLogo,
    organizationLogos, // NEW: Pass logos to all templates
    signatoryName1,
    signatoryTitle1,
    signatureUrl1,
    signatoryName2,
    signatoryTitle2,
    signatureUrl2,
    certificateId,
  };

  // Normalize template ID - handle both "template1" and "1" formats
  const normalizedId = templateId.replace(/^template/i, "");

  // Global Template Library System
  // Templates are added sequentially as they are created
  switch (normalizedId) {
    case "1":
      return <CertificateTemplate1 {...templateProps} />;

    case "2":
      return <CertificateTemplate2 {...templateProps} />;

    case "3":
      return <CertificateTemplate3 {...templateProps} />;

    case "4":
      return <CertificateTemplate4 {...templateProps} />;

    case "5":
      return <CertificateTemplate5 {...templateProps} />;

    case "6":
      return <CertificateTemplate5 {...templateProps} />;

    case "7":
      return <CertificateTemplate7 {...templateProps} />;

    case "8":
      return <CertificateTemplate8 {...templateProps} />;

    case "9":
      return <CertificateTemplate9 {...templateProps} />;

    case "10":
      return <CertificateTemplate10 {...templateProps} />;

    case "11":
      return <CertificateTemplate11 {...templateProps} />;

    case "12":
      return <CertificateTemplate12 {...templateProps} />;

    case "13":
      return <CertificateTemplate13 {...templateProps} />;

    case "14":
      return <CertificateTemplate14 {...templateProps} />;

    case "15":
      return <CertificateTemplate15 {...templateProps} />;

    case "16":
      return <CertificateTemplate16 {...templateProps} />;

    case "17":
      return <CertificateTemplate17 {...templateProps} />;

    case "18":
      return <CertificateTemplate18 {...templateProps} />;

    case "19":
      return <CertificateTemplate19 {...templateProps} />;
    
    case "20":
      return <CertificateTemplate20 {...templateProps} />;

    case "21":
      return <CertificateTemplate21 {...templateProps} />;

    case "22":
      return <CertificateTemplate22 {...templateProps} />;
    
    case "23":
      return <CertificateTemplate23 {...templateProps} />;

    case "24":
      return <CertificateTemplate24 {...templateProps} />;

    case "25":
      return <CertificateTemplate25 {...templateProps} />;

    case "26":
      return <CertificateTemplate26 {...templateProps} />;

    case "27":
      return <CertificateTemplate27 {...templateProps} />;
    
    case "28":
      return <CertificateTemplate28 {...templateProps} />;
    
    case "29":
      return <CertificateTemplate29 {...templateProps} />;

    case "30":
      return <CertificateTemplate30 {...templateProps} />;

    case "31":
      return <CertificateTemplate31 {...templateProps} />;

    case "32":
      return <CertificateTemplate32 {...templateProps} />;

    case "33":
      return <CertificateTemplate33 {...templateProps} />;
    
    case "34":
      return <CertificateTemplate34 {...templateProps} />;

    case "35":
      return <CertificateTemplate35 {...templateProps} />;

    case "36":
      return <CertificateTemplate36 {...templateProps} />;

    case "37":
      return <CertificateTemplate37 {...templateProps} />;

    case "38":
      return <CertificateTemplate38 {...templateProps} />;

    case "39":
      return <CertificateTemplate39 {...templateProps} />;

    // All other template IDs fall back to Template 1
    default:
      // Silent fallback to Template 1 - no warning needed
      // The fallback is expected behavior for the unified template system
      return <CertificateTemplate1 {...templateProps} />;
  }
}
