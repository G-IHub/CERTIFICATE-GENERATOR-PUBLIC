import React from "react";
import img1 from "../../assets/img1.png";
import img2 from "../../assets/img2.png";
import img3 from "../../assets/img3.png";

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
  ];
  return (
    <section className="py-10 px-4 md:px-28 md:py-16 bg-[#F9F9F9]">
      <div className="text-center md:space-y-4 mb-4 md:mb-12">
        <h2 className="font-extrabold text-3xl md:text-4xl">
          What Our Users Say
        </h2>
        <p className="text-sm md:text-base text-gray-500">
          Here is what our previous users think
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="shadow-sm rounded-lg p-6 bg-white flex flex-col justify-between h-full"
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
        ))}
      </div>
    </section>
  );
};

export default Testimonial;