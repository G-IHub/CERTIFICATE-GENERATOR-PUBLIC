import CertificateTemplate1 from "./templates/CertificateTemplate1";
import CertificateTemplate2 from "./templates/CertificateTemplate2";
import CertificateTemplate3 from "./templates/CertificateTemplate3";
import CertificateTemplate4 from "./templates/CertificateTemplate4";
import CertificateTemplate5 from "./templates/CertificateTemplate5";
import CertificateTemplate6 from "./templates/CertificateTemplate6";
import CertificateTemplate7 from "./templates/CertificateTemplate7";
import CertificateTemplate from "./CertificateTemplate";

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
  customTemplateConfig?: any;
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
  customTemplateConfig,
}: CertificateRendererProps) {
  // Debugging: log render invocation when in development to help trace missing previews
  try {
    // eslint-disable-next-line no-console
    console.log("CertificateRenderer: rendering", {
      templateId,
      isPreview,
      mode,
    });
  } catch (e) {
    /* ignore logging failure */
  }
  // If a custom template config is provided, render the generic renderer
  if (customTemplateConfig) {
    // Provide minimal program shape required by CertificateTemplate
    const program: any = {
      id: "preview",
      name: courseTitle,
      description,
      template: "impact",
      certificates: 0,
      testimonials: 0,
    };
    return (
      <CertificateTemplate
        subsidiary={null}
        program={program}
        studentName={recipientName}
        certificateId={"preview"}
        completionDate={date}
        preview={isPreview}
        customTemplateConfig={customTemplateConfig}
      />
    );
  }
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

    // All other template IDs fall back to Template 1
    // This ensures the system never breaks even if an invalid ID is used
    default:
      // Silent fallback to Template 1 - no warning needed
      // The fallback is expected behavior for the unified template system
      return <CertificateTemplate1 {...templateProps} />;
  }
}
