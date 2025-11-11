import React from 'react';
import { Award, Seal, Star, Shield, Check, Crown, Sparkles, Hexagon } from 'lucide-react';
import type { Subsidiary, Program, OrganizationSettings } from '../App';

interface CertificateTemplateProps {
  subsidiary: Subsidiary | null;
  program: Program;
  studentName: string;
  certificateId: string;
  completionDate: string;
  template?: string;
  showWatermark?: boolean;
  preview?: boolean;
  customTemplateConfig?: any; // Custom template configuration from Template Builder
}

const CertificateTemplate: React.FC<CertificateTemplateProps> = ({
  subsidiary,
  program,
  studentName,
  certificateId,
  completionDate,
  template = 'modern',
  showWatermark = true,
  preview = false,
  customTemplateConfig
}) => {
  // Log custom template config for debugging
  if (customTemplateConfig) {
    console.log('🎨 CertificateTemplate: Using custom template config:', customTemplateConfig);
  }
  
  // Define formatDate BEFORE early return so it's available to renderCustomTemplate
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Render custom template using configuration from Template Builder
  const renderCustomTemplate = () => {
    const config = customTemplateConfig;
    console.log('🎨 Rendering custom template with config:', config);
    
    // Build background style
    const backgroundStyle: React.CSSProperties = {};
    if (config.colors?.backgroundType === 'gradient') {
      backgroundStyle.backgroundImage = `linear-gradient(${config.colors.gradientDirection}, ${config.colors.gradientFrom}, ${config.colors.gradientTo})`;
    } else {
      backgroundStyle.backgroundColor = config.colors?.background || '#ffffff';
    }
    
    // Border style
    const borderStyle: React.CSSProperties = {
      borderWidth: `${config.layout?.borderWidth || 4}px`,
      borderStyle: config.layout?.borderStyle || 'solid',
      borderColor: config.colors?.border || config.colors?.accentColor || '#ea580c',
    };
    
    return (
      <div 
        className={`relative w-full max-w-4xl mx-auto aspect-[1.414/1] overflow-hidden ${preview ? 'p-4' : 'p-8'} ${preview ? 'shadow-2xl' : 'shadow-lg'}`}
        style={{ ...backgroundStyle, ...borderStyle }}
      >
        {/* Main content */}
        <div className="relative z-10 h-full flex flex-col">
          {/* Logo */}
          {config.elements?.logo?.enabled && config.elements.logo.url && (
            <div className={`flex justify-${config.elements.logo.alignment || 'center'} ${preview ? 'mb-2' : 'mb-4'}`}>
              <img 
                src={config.elements.logo.url} 
                alt="Organization Logo"
                className={`object-contain ${preview ? 'h-12' : 'h-16'}`}
                style={{ maxWidth: `${config.elements.logo.size || 200}px` }}
              />
            </div>
          )}
          
          {/* Title */}
          {config.content?.title && (
            <div className={`text-center ${preview ? 'mb-2' : 'mb-4'}`}>
              <h1 
                className={preview ? 'text-2xl' : 'text-4xl'}
                style={{
                  color: config.colors?.textColor || '#000000',
                  fontFamily: config.typography?.headingFont || 'serif',
                }}
              >
                {config.content.title}
              </h1>
            </div>
          )}
          
          {/* Subtitle */}
          {config.content?.subtitle && (
            <div className={`text-center ${preview ? 'mb-3' : 'mb-6'}`}>
              <p 
                className={preview ? 'text-sm' : 'text-base'}
                style={{
                  color: config.colors?.textColor || '#000000',
                  fontFamily: config.typography?.bodyFont || 'sans-serif',
                }}
              >
                {config.content.subtitle}
              </p>
            </div>
          )}
          
          {/* Student Name Section */}
          <div className={`text-center flex-1 flex flex-col justify-center ${preview ? 'my-2' : 'my-6'}`}>
            <p 
              className={preview ? 'text-sm mb-1' : 'text-lg mb-2'}
              style={{
                color: config.colors?.textColor || '#000000',
                fontFamily: config.typography?.bodyFont || 'sans-serif',
              }}
            >
              This certifies that
            </p>
            <h2 
              className={preview ? 'text-3xl my-2' : 'text-5xl my-4'}
              style={{
                color: config.colors?.accentColor || '#ea580c',
                fontFamily: config.typography?.headingFont || 'serif',
              }}
            >
              {studentName}
            </h2>
            <p 
              className={preview ? 'text-sm mb-1' : 'text-lg mb-2'}
              style={{
                color: config.colors?.textColor || '#000000',
                fontFamily: config.typography?.bodyFont || 'sans-serif',
              }}
            >
              has successfully completed the
            </p>
            <h3 
              className={preview ? 'text-lg' : 'text-2xl'}
              style={{
                color: config.colors?.textColor || '#000000',
                fontFamily: config.typography?.headingFont || 'serif',
              }}
            >
              {program.name}
            </h3>
            {program.description && (
              <p 
                className={`italic max-w-2xl mx-auto ${preview ? 'text-xs mt-1' : 'text-sm mt-2'}`}
                style={{
                  color: config.colors?.textColor || '#000000',
                  fontFamily: config.typography?.bodyFont || 'sans-serif',
                }}
              >
                {program.description}
              </p>
            )}
          </div>
          
          {/* Signatures */}
          {config.elements?.signatures && config.elements.signatures.length > 0 && (
            <div className={`flex justify-center gap-${preview ? '4' : '8'} ${preview ? 'mt-2' : 'mt-6'}`}>
              {config.elements.signatures.map((sig: any, index: number) => (
                <div key={index} className="text-center">
                  {sig.imageUrl && (
                    <img 
                      src={sig.imageUrl} 
                      alt={sig.name}
                      className={`mx-auto mb-1 ${preview ? 'h-8' : 'h-12'}`}
                    />
                  )}
                  <div 
                    className={`border-t-2 ${preview ? 'pt-0.5' : 'pt-1'} min-w-[120px]`}
                    style={{ borderColor: config.colors?.textColor || '#000000' }}
                  >
                    <p 
                      className={preview ? 'text-xs' : 'text-sm'}
                      style={{
                        color: config.colors?.textColor || '#000000',
                        fontFamily: config.typography?.bodyFont || 'sans-serif',
                      }}
                    >
                      {sig.name}
                    </p>
                    {sig.title && (
                      <p 
                        className={`text-gray-600 ${preview ? 'text-[10px]' : 'text-xs'}`}
                        style={{ fontFamily: config.typography?.bodyFont || 'sans-serif' }}
                      >
                        {sig.title}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Footer with Date and Certificate ID */}
          <div className={`flex justify-between items-end ${preview ? 'mt-2 text-xs' : 'mt-6 text-sm'}`}>
            <div>
              <p 
                className="text-gray-600"
                style={{ fontFamily: config.typography?.bodyFont || 'sans-serif' }}
              >
                Date: {formatDate(completionDate)}
              </p>
            </div>
            <div className="text-right">
              <p 
                className="text-gray-600 font-mono"
                style={{ fontFamily: config.typography?.bodyFont || 'sans-serif' }}
              >
                ID: {certificateId}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // If custom template config is provided, render custom template
  if (customTemplateConfig) {
    return renderCustomTemplate();
  }

  const getTemplateStyles = () => {
    // Use custom primary color from settings if available, otherwise use organization's primary color
    const primaryColor = subsidiary?.settings?.primaryColor || subsidiary?.primaryColor || '#6366f1';
    
    switch (template) {
      case 'elegant':
        return {
          background: 'bg-gradient-to-br from-slate-50 to-gray-100',
          border: 'border-4 border-double',
          accent: primaryColor,
          decorative: true,
          seal: true
        };
      case 'academic':
        return {
          background: 'bg-white',
          border: 'border-8 border-solid',
          accent: '#1f2937',
          decorative: true,
          seal: true,
          formal: true
        };
      case 'corporate':
        return {
          background: 'bg-gradient-to-r from-blue-50 to-indigo-50',
          border: 'border-2 border-solid',
          accent: primaryColor,
          clean: true,
          modern: true
        };
      case 'professional':
        return {
          background: 'bg-white',
          border: 'border-4 border-solid',
          accent: '#374151',
          minimalist: true,
          clean: true
        };
      case 'dynamic':
        return {
          background: 'bg-gradient-to-br from-orange-50 to-red-50',
          border: 'border-4 border-solid',
          accent: primaryColor,
          energetic: true,
          modern: true
        };
      case 'tech':
        return {
          background: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50',
          border: 'border-2 border-solid',
          accent: '#4f46e5',
          futuristic: true,
          tech: true
        };
      case 'nature':
        return {
          background: 'bg-gradient-to-br from-green-50 to-emerald-50',
          border: 'border-4 border-solid',
          accent: '#059669',
          organic: true,
          natural: true
        };
      case 'traditional':
        return {
          background: 'bg-gradient-to-br from-amber-50 to-yellow-50',
          border: 'border-8 border-double',
          accent: '#92400e',
          classic: true,
          ornate: true
        };
      case 'green':
        return {
          background: 'bg-gradient-to-br from-lime-50 to-green-50',
          border: 'border-4 border-solid',
          accent: primaryColor,
          eco: true,
          fresh: true
        };
      case 'laboratory':
        return {
          background: 'bg-gradient-to-br from-purple-50 to-violet-50',
          border: 'border-4 border-solid',
          accent: primaryColor,
          scientific: true,
          precise: true
        };
      case 'clinical':
        return {
          background: 'bg-gradient-to-br from-blue-50 to-cyan-50',
          border: 'border-4 border-solid',
          accent: '#0891b2',
          medical: true,
          sterile: true
        };
      default: // modern
        return {
          background: 'bg-gradient-to-br from-indigo-50 to-purple-50',
          border: 'border-4 border-solid',
          accent: primaryColor,
          modern: true,
          sleek: true
        };
    }
  };

  const styles = getTemplateStyles();

  const DecorativeCorners = () => (
    <>
      {/* Top corners */}
      <div className="absolute top-4 left-4 w-16 h-16 opacity-10">
        <div 
          className="w-full h-full border-t-4 border-l-4 rounded-tl-2xl"
          style={{ borderColor: styles.accent }}
        />
      </div>
      <div className="absolute top-4 right-4 w-16 h-16 opacity-10">
        <div 
          className="w-full h-full border-t-4 border-r-4 rounded-tr-2xl"
          style={{ borderColor: styles.accent }}
        />
      </div>
      
      {/* Bottom corners */}
      <div className="absolute bottom-4 left-4 w-16 h-16 opacity-10">
        <div 
          className="w-full h-full border-b-4 border-l-4 rounded-bl-2xl"
          style={{ borderColor: styles.accent }}
        />
      </div>
      <div className="absolute bottom-4 right-4 w-16 h-16 opacity-10">
        <div 
          className="w-full h-full border-b-4 border-r-4 rounded-br-2xl"
          style={{ borderColor: styles.accent }}
        />
      </div>
    </>
  );

  const CertificateSeal = () => {
    const SealIcon = styles.formal ? Shield : 
                    styles.tech ? Hexagon :
                    styles.energetic ? Star :
                    styles.classic ? Crown : Award;
    
    // Don't show seal in preview mode to avoid layout conflicts
    if (preview) return null;
    
    return (
      <div className="absolute bottom-8 right-8 flex flex-col items-center">
        <div 
          className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg border-4"
          style={{ 
            backgroundColor: styles.accent + '15',
            borderColor: styles.accent 
          }}
        >
          <SealIcon 
            className="w-10 h-10"
            style={{ color: styles.accent }}
          />
        </div>
        <div className="mt-2 text-center">
          <div 
            className="text-xs font-semibold"
            style={{ color: styles.accent }}
          >
            CERTIFIED
          </div>
          <div className="text-xs text-gray-600 font-mono">
            {certificateId}
          </div>
        </div>
      </div>
    );
  };

  const WatermarkPattern = () => {
    if (!showWatermark) return null;
    
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="transform rotate-45 opacity-5">
          <div className="grid grid-cols-6 gap-8">
            {Array.from({ length: 24 }).map((_, i) => (
              <Award 
                key={i} 
                className="w-12 h-12 text-gray-400"
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  const OrganizationHeader = () => {
    // Use custom logo from settings if available, otherwise fallback to organization logo
    const logoUrl = subsidiary?.settings?.logo || subsidiary?.logo;
    
    return (
      <div className={`text-center ${preview ? 'mb-4' : 'mb-8'}`}>
        <div className={`flex items-center justify-center ${preview ? 'gap-2' : 'gap-4'} ${preview ? 'mb-2' : 'mb-4'}`}>
          {logoUrl && (
            <>
              <img 
                src={logoUrl} 
                alt={subsidiary?.name || 'Organization'}
                className={`${preview ? 'h-12' : 'h-16'} w-auto max-w-[200px] object-contain`}
              />
              <div 
                className={`w-1 ${preview ? 'h-12' : 'h-16'} rounded-full opacity-30`}
                style={{ backgroundColor: styles.accent }}
              />
            </>
          )}
          <div className="text-left">
            <h2 
              className={`${preview ? 'text-xl' : 'text-2xl'} font-bold`}
              style={{ color: styles.accent }}
            >
              {subsidiary?.shortName || 'Organization'}
            </h2>
            <p className="text-gray-600 text-sm">{subsidiary?.name || 'Organization Name'}</p>
          </div>
        </div>
      </div>
    );
  };

  const CertificateTitle = () => (
    <div className={`text-center ${preview ? 'mb-4' : 'mb-8'}`}>
      <div className={`flex items-center justify-center gap-2 ${preview ? 'mb-1' : 'mb-2'}`}>
        <div 
          className="w-8 h-0.5 rounded-full"
          style={{ backgroundColor: styles.accent }}
        />
        <Award 
          className={`${preview ? 'w-5 h-5' : 'w-6 h-6'}`}
          style={{ color: styles.accent }}
        />
        <div 
          className="w-8 h-0.5 rounded-full"
          style={{ backgroundColor: styles.accent }}
        />
      </div>
      <h1 className={`${preview ? 'text-3xl' : 'text-4xl'} font-bold text-gray-800 ${preview ? 'mb-1' : 'mb-2'}`}>
        Certificate of Completion
      </h1>
      <div 
        className="w-24 h-1 mx-auto rounded-full"
        style={{ backgroundColor: styles.accent }}
      />
    </div>
  );

  const StudentSection = () => (
    <div className={`text-center ${preview ? 'mb-4' : 'mb-8'}`}>
      <p className={`${preview ? 'text-base' : 'text-lg'} text-gray-600 ${preview ? 'mb-1' : 'mb-2'}`}>This certifies that</p>
      <h2 
        className={`${preview ? 'text-4xl' : 'text-5xl'} font-bold ${preview ? 'mb-2' : 'mb-4'}`}
        style={{ color: styles.accent }}
      >
        {studentName}
      </h2>
      <p className={`${preview ? 'text-base' : 'text-lg'} text-gray-600 ${preview ? 'mb-1' : 'mb-2'}`}>has successfully completed the</p>
      <h3 className={`${preview ? 'text-xl' : 'text-2xl'} font-bold text-gray-800 ${preview ? 'mb-3' : 'mb-6'}`}>
        {program.name}
      </h3>
      {program.description && (
        <p className={`text-gray-600 max-w-2xl mx-auto italic ${preview ? 'text-sm' : ''}`}>
          {program.description}
        </p>
      )}
    </div>
  );

  const CompletionDetails = () => {
    const settings = subsidiary?.settings;
    const hasSignatories = settings && settings.signatories && settings.signatories.length > 0;
    
    return (
      <div className={`flex ${preview ? 'flex-col gap-3' : 'justify-between items-end'} ${preview ? 'mt-4' : 'mt-12'}`}>
        {preview ? (
          <>
            {/* Compact stacked layout for preview */}
            <div className="flex justify-between items-start gap-2">
              <div className="text-left flex-1 min-w-0">
                <p className="text-gray-600 mb-0.5 text-[10px]">Date of Completion</p>
                <p 
                  className="text-sm font-bold truncate"
                  style={{ color: styles.accent }}
                >
                  {formatDate(completionDate)}
                </p>
              </div>
              <div className="text-right flex-1 min-w-0">
                <p className="text-gray-600 mb-0.5 text-[10px]">Certificate ID</p>
                <p 
                  className="text-xs font-mono font-bold truncate"
                  style={{ color: styles.accent }}
                >
                  {certificateId}
                </p>
              </div>
            </div>
            
            {/* Signature section */}
            {hasSignatories ? (
              <div className="flex gap-4 justify-center">
                {settings!.signatories!.slice(0, 2).map((signatory) => (
                  <div key={signatory.id} className="text-center">
                    {signatory.signatureUrl && (
                      <div className="h-8 mb-1 flex items-center justify-center">
                        <img 
                          src={signatory.signatureUrl} 
                          alt={`${signatory.name} signature`}
                          className="max-h-8 max-w-24 object-contain"
                        />
                      </div>
                    )}
                    <div 
                      className="w-24 h-0.5 mb-1 mx-auto"
                      style={{ backgroundColor: styles.accent }}
                    />
                    <p className="text-[10px] font-semibold text-gray-800 truncate max-w-24">{signatory.name}</p>
                    <p className="text-[9px] text-gray-600 truncate max-w-24">{signatory.title}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center">
                <div 
                  className="w-24 h-0.5 mb-1 mx-auto"
                  style={{ backgroundColor: styles.accent }}
                />
                <p className="text-[10px] text-gray-600">Authorized Signature</p>
                <p className="text-[9px] text-gray-500">Program Director</p>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Original wide layout for full size */}
            <div className="text-left">
              <p className="text-gray-600 mb-1">Date of Completion</p>
              <p 
                className="text-xl font-bold"
                style={{ color: styles.accent }}
              >
                {formatDate(completionDate)}
              </p>
              {program.duration && (
                <p className="text-sm text-gray-500 mt-1">
                  Duration: {program.duration}
                </p>
              )}
            </div>
            
            {/* Signatories Section */}
            {hasSignatories ? (
              <div className="flex gap-8 px-8">
                {settings!.signatories!.slice(0, 2).map((signatory) => (
                  <div key={signatory.id} className="text-center">
                    {signatory.signatureUrl && (
                      <div className="h-12 mb-2 flex items-center justify-center">
                        <img 
                          src={signatory.signatureUrl} 
                          alt={`${signatory.name} signature`}
                          className="max-h-12 max-w-32 object-contain"
                        />
                      </div>
                    )}
                    <div 
                      className="w-32 h-0.5 mb-2 mx-auto"
                      style={{ backgroundColor: styles.accent }}
                    />
                    <p className="text-sm font-semibold text-gray-800">{signatory.name}</p>
                    <p className="text-xs text-gray-600 mt-1">{signatory.title}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center px-8">
                <div 
                  className="w-32 h-0.5 mb-2"
                  style={{ backgroundColor: styles.accent }}
                />
                <p className="text-sm text-gray-600">Authorized Signature</p>
                <p className="text-xs text-gray-500 mt-1">Program Director</p>
              </div>
            )}
            
            <div className="text-right">
              <p className="text-gray-600 mb-1">Certificate ID</p>
              <p 
                className="text-lg font-mono font-bold"
                style={{ color: styles.accent }}
              >
                {certificateId}
              </p>
            </div>
          </>
        )}
      </div>
    );
  };

  const SpecialtyElements = () => {
    if (styles.tech) {
      return (
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <div className="grid grid-cols-4 gap-1 p-4">
            {Array.from({ length: 16 }).map((_, i) => (
              <div 
                key={i}
                className="w-2 h-2 rounded-sm"
                style={{ backgroundColor: styles.accent }}
              />
            ))}
          </div>
        </div>
      );
    }
    
    if (styles.natural || styles.eco) {
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-8 left-8 opacity-10">
            <Sparkles className="w-8 h-8" style={{ color: styles.accent }} />
          </div>
          <div className="absolute top-16 right-16 opacity-10">
            <Sparkles className="w-6 h-6" style={{ color: styles.accent }} />
          </div>
          <div className="absolute bottom-16 left-16 opacity-10">
            <Sparkles className="w-7 h-7" style={{ color: styles.accent }} />
          </div>
        </div>
      );
    }
    
    if (styles.classic || styles.ornate) {
      return (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-4 transform -translate-y-1/2 opacity-10">
            <Crown className="w-12 h-12" style={{ color: styles.accent }} />
          </div>
          <div className="absolute top-1/2 right-4 transform -translate-y-1/2 opacity-10">
            <Crown className="w-12 h-12" style={{ color: styles.accent }} />
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className={`
      relative w-full max-w-4xl mx-auto aspect-[1.414/1] overflow-hidden
      ${preview ? 'p-4' : 'p-8'}
      ${styles.background}
      ${styles.border}
      print:shadow-none print:border-black
      ${preview ? 'shadow-2xl' : 'shadow-lg'}
    `}
    style={{ borderColor: styles.accent }}
    >
      {/* Watermark */}
      <WatermarkPattern />
      
      {/* Decorative corners */}
      {styles.decorative && <DecorativeCorners />}
      
      {/* Specialty design elements */}
      <SpecialtyElements />
      
      {/* Main content */}
      <div className="relative z-10 h-full flex flex-col">
        <OrganizationHeader />
        <CertificateTitle />
        
        <div className="flex-1 flex flex-col justify-center">
          <StudentSection />
        </div>
        
        <CompletionDetails />
      </div>
      
      {/* Certificate seal */}
      {styles.seal && <CertificateSeal />}
      
      {/* Quality assurance footer */}
      {!preview && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Check className="w-3 h-3" />
            <span>Verified Digital Certificate</span>
            <Check className="w-3 h-3" />
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificateTemplate;