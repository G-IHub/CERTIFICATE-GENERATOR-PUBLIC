import React from "react";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

const FAQ: React.FC = () => {
  return (
    <section className="bg-white px-6 sm:px-6 md:px-28 py-8 md:py-16">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-8 md:mb-12">
          <h2 className="font-extrabold text-2xl sm:text-3xl md:text-4xl leading-tight">
            Frequently Asked Questions
          </h2>
          <p className="leading-7 text-sm sm:text-base text-gray-600">
            Can't find the answers you're looking for? Reach out to our customer
            support team.
          </p>
        </div>

        <div className="mx-auto w-full max-w-3xl divide-y-2 divide-gray-200 border-b-2 border-gray-200 transition-all duration-300 rounded-lg overflow-hidden bg-white">
          <Disclosure as="div" className="p-4 sm:p-6">
            <DisclosureButton className="group flex w-full items-center justify-between text-left">
              <span className="leading-6 font-medium text-sm sm:text-base">
                Do I need design skills to create certificates?
              </span>
              <ChevronDownIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500 group-data-open:rotate-180 transform transition-transform duration-200" />
            </DisclosureButton>
            <DisclosurePanel
              transition
              className="mt-3 text-sm sm:text-base text-gray-600 origin-top transition duration-200 ease-out"
            >
              Not at all! Simply choose a ready-made template, upload your logo,
              and customize the details. You'll have a beautiful certificate in
              minutes.
            </DisclosurePanel>
          </Disclosure>

          <Disclosure as="div" className="p-4 sm:p-6">
            <DisclosureButton className="group flex w-full items-center justify-between text-left">
              <span className="leading-6 font-medium text-sm sm:text-base">
                Are the certificates downloadable or shareable?
              </span>
              <ChevronDownIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500 group-data-open:rotate-180 transform transition-transform duration-200" />
            </DisclosureButton>
            <DisclosurePanel
              transition
              className="mt-3 text-sm sm:text-base text-gray-600 origin-top transition duration-200 ease-out"
            >
              Certificates can be downloaded as PNGs and shared via unique
              links. You can also embed them in emails or post them to social
              media.
            </DisclosurePanel>
          </Disclosure>

          <Disclosure as="div" className="p-4 sm:p-6">
            <DisclosureButton className="group flex w-full items-center justify-between text-left">
              <span className="leading-6 font-medium text-sm sm:text-base">
                Can I add signatories or my organization's logo?
              </span>
              <ChevronDownIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500 group-data-open:rotate-180 transform transition-transform duration-200" />
            </DisclosureButton>
            <DisclosurePanel
              transition
              className="mt-3 text-sm sm:text-base text-gray-600 origin-top transition duration-200 ease-out"
            >
              Yes. Upload your organization's logo and add multiple signatories
              with custom titles. Signatures can be added as images or via
              digital signing integrations.
            </DisclosurePanel>
          </Disclosure>

          <Disclosure as="div" className="p-4 sm:p-6">
            <DisclosureButton className="group flex w-full items-center justify-between text-left" >
              <span className="leading-6 font-medium text-sm sm:text-base" >
                Can I get feedback from my students?
              </span>
              <ChevronDownIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500 group-data-open:rotate-180 transform transition duration-200" />
            </DisclosureButton>
            <DisclosurePanel transition className="mt-3 text-sm sm:text-base text-gray-600 origin-top transition duration-200 ease-out">
              Yes. Students can optionally send feedback on a course, and you can retrieve and consequently download them for other uses in the Testimonials tab.
            </DisclosurePanel>
          </Disclosure>

          {/* <Disclosure as="div" className="p-4 sm:p-6">
            <DisclosureButton className="group flex w-full items-center justify-between text-left">
              <span className="leading-6 font-medium text-sm sm:text-base">
                Can I integrate this with my LMS or event platform?
              </span>
              <ChevronDownIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500 group-data-open:rotate-180 transform transition-transform duration-200" />
            </DisclosureButton>
            <DisclosurePanel
              transition
              className="mt-3 text-sm sm:text-base text-gray-600 origin-top transition duration-200 ease-out"
            >
              Yes. Our API and integration options let you connect your
              certificate system to learning management systems, event tools, or
              CRMs.
            </DisclosurePanel>
          </Disclosure> */}

          {/* <Disclosure as="div" className="p-4 sm:p-6">
            <DisclosureButton className="group flex w-full items-center justify-between text-left">
              <span className="leading-6 font-medium text-sm sm:text-base">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Quo,
                est.
              </span>
              <ChevronDownIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500 group-data-open:rotate-180 transform transition-transform duration-200" />
            </DisclosureButton>
            <DisclosurePanel
              className="mt-3 text-sm sm:text-base text-gray-600 origin-top transition duration-200 ease-out"
            >
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Delectus
              nemo quam soluta ratione quia vero reprehenderit doloribus nam?
            </DisclosurePanel>DisclosurePanel
              tra
          </Disclosure> */}
        </div>
      </div>
    </section>
  );
};

export default FAQ;