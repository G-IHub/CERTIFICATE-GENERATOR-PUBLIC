import React from "react";
import img1 from "../../assets/img1.png";
import img2 from "../../assets/img2.png";
import img3 from "../../assets/img3.png";
import francis from "../../assets/Testimonials/francis.png";
import gladys from "../../assets/Testimonials/gladys.png";
import mercy from "../../assets/Testimonials/mercy.jpeg";
import { describe } from "node:test";

const Testimonial: React.FC = () => {
  const testimonials = [
    {
      description:
        "This platform made certificate creation effortless! We designed, customized, and sent out hundreds of certificates in minutes, no more manual work or design stress.",
      icon: img1,
      name: "Alice Johnson",
      role: "Event Coordinator",
    },
    {
      description:
        "I was amazed at how fast we could generate branded certificates! Upload, edit, send all done in one click. Our participants loved the professional look.",
      icon: img2,
      name: "Michael Smith",
      role: "Training Manager(BTC)",
    },
    {
      description:
        "Before this, issuing certificates after every workshop was a headache. Now, it's completely automated. I just upload my list and the platform does the rest!.",
      icon: img3,
      name: "Samantha Lee",
      role: "Training Specialist",
    },
    {
      description:
        "I had an excellent experience using this certificate generator platform. The design templates are modern and customizable, the process is straightforward, and the certificates look very professional. It saved me a lot of time and ensured consistency across multiple certificates. I would confidently recommend this platform to educators and organizations.",
      icon: gladys,
      name: "Gladys Egunjobi",
      role: "Research Assistant",
    },
    {
      description:
        "The certificate generator is simple and efficient, it is a fast and user-friendly platform that delivers clean, professional certificates with ease. ",
      icon: mercy,
      name: "Mercy Odeyemi",
      role: "Team Lead, Impact Program",
    },
  ];
  return (
    <>
      <section className="py-10 md:py-16 bg-[#F9F9F9]">
        <div className="text-center md:space-y-4 mb-4 md:mb-12">
          <h2 className="font-extrabold text-3xl md:text-4xl">
            What Our Users Say
          </h2>
          <p className="text-sm md:text-base text-gray-500">
            Here is what our previous users think
          </p>
        </div>
        <div className="overflow-hidden">
          <div className="marquee-content gap-4 items-stretch cursor-pointer">
            {[0, 1].flatMap((rep) =>
              testimonials.map((testimonial, index) => (
                <div
                  key={`${rep}-${index}`}
                  className="shadow-sm rounded-lg p-6 bg-white flex flex-col justify-between h-full w-96 flex-none"
                >
                  <p className="text-sm mb-4">"{testimonial.description}"</p>
                  <div className="flex items-center mt-4">
                    <img
                      src={testimonial.icon}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <span className="text-sm text-gray-500">
                        {testimonial.role}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Testimonial;
