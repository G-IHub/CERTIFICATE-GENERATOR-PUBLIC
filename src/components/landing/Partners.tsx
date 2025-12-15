// import React from 'react'
import ispora from "../../assets/iSpora.png";
import startuptrybe00 from "../../assets/startuptrybe00.png";
import startuptrybe from "../../assets/startuptrybe.png";
import gnatures from "../../assets/gnatures.png";
import gsclogo from "../../assets/gsclogo.png";
import ginsti from "../../assets/ginsti.png";
import gihub from "../../assets/gihub.png";
import glabs from "../../assets/glabs.png";
import gholdings from "../../assets/gholdings.png";

interface PartnersProps {
  logo: string;
  name: string;
  link: string;
}

const Partners: React.FC<PartnersProps> = () => {
  const partners: PartnersProps[] = [
    {
      logo: ispora,
      name: "iSpora",
      link: "https://ispora.com",
    },
    {
      logo: startuptrybe,
      name: "Startup Trybe",
      link: "https://www.linkedin.com/company/startuptrybehq/",
    },
    {
      logo: gnatures,
      name: "Gnatures",
      link: "https://gnatures.com/",
    },
    {
      logo: gsclogo,
      name: "Genomac Services and Consults",
      link: "https://ng.linkedin.com/company/genomac-services-and-consult-gsc",
    },
    {
      logo: ginsti,
      name: "Genomac Institute",
      link: "https://genomachub.com/",
    },
    {
      logo: gihub,
      name: "Genomac Innovation Hub",
      link: "https://genomac.io",
    },
    {
      logo: glabs,
      name: "Genomac Labs",
      link: "https://genomaclabs.com/",
    },
    {
      logo: gholdings,
      name: "Genomac Holdings",
      link: "https://genomacholdings.com/",
    },
  ];
  return (
    <>
      <section
        className="bg-white py-10 md:py-16"
        style={{ backgroundColor: "#FAFAFA" }}
      >
        <div className="">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="font-extrabold text-2xl sm:text-3xl md:text-4xl">
              Partners
            </h2>
          </div>

          <div className="overflow-hidden">
            <div className="marquee-content items-center">
              {[0, 1].flatMap((rep) =>
                partners.map((partner, index) => (
                  <a
                    key={`${rep}-${index}`}
                    href={partner.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center px-6"
                  >
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="w-16 sm:w-20 hover:opacity-80 transition-opacity"
                    />
                  </a>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Partners;
