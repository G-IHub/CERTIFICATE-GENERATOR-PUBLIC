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
  signatoryName1?: string;
  signatoryTitle1?: string;
  signatureUrl1?: string;
  signatoryName2?: string;
  signatoryTitle2?: string;
  signatureUrl2?: string;
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
  signatoryName1,
  signatoryTitle1,
  signatureUrl1,
  signatoryName2,
  signatoryTitle2,
  signatureUrl2,
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
    signatoryName1,
    signatoryTitle1,
    signatureUrl1,
    signatoryName2,
    signatoryTitle2,
    signatureUrl2,
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
      return <CertificateTemplate6 {...templateProps} />;

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

    // All other template IDs fall back to Template 1
    default:
      // Silent fallback to Template 1 - no warning needed
      // The fallback is expected behavior for the unified template system
      return <CertificateTemplate1 {...templateProps} />;
  }
}