import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CertificateTemplate1 from '../templates/CertificateTemplate1';
import CertificateTemplate2 from '../templates/CertificateTemplate2';
import CertificateTemplate3 from '../templates/CertificateTemplate3';
import CertificateTemplate4 from '../templates/CertificateTemplate4';
import CertificateTemplate5 from '../templates/CertificateTemplate5';

const TemplateDisplay = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const templates = [
    {
      id: 1,
      name: 'Professional',
      component: CertificateTemplate1,
    },
    {
      id: 2,
      name: 'Modern',
      component: CertificateTemplate2,
    },
    {
      id: 3,
      name: 'Elegant',
      component: CertificateTemplate3,
    },
    {
      id: 4,
      name: 'Classic',
      component: CertificateTemplate4,
    },
    {
      id: 5,
      name: 'Creative',
      component: CertificateTemplate5,
    },
  ];

  const sampleData = {
    header: 'Certificate of Achievement',
    courseTitle: 'Professional Development Program',
    description: 'Successfully completed with distinction',
    date: new Date().toLocaleDateString(),
    recipientName: 'John Doe',
    organizationName: 'Certifyer',
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? templates.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === templates.length - 1 ? 0 : prevIndex + 1
    );
  };

  const CurrentTemplate = templates[currentIndex].component;

  return (
    <section className='bg-white px-6 md:px-28 py-16 flex flex-col justify-center items-center gap-8'>
      <div className='text-center space-y-4 w-full'>
        <h2 className='font-extrabold text-2xl sm:text-3xl md:text-4xl tracking-tight text-gray-900'>
          Beautiful Certificate Templates
        </h2>
        <p className='text-[#696969] leading-6 text-sm md:text-basemax-w-2xl mx-auto'>
          Choose from our collection of professionally designed templates. Customize to match your brand.
        </p>
      </div>

      {/* Carousel */}
      <div className='w-full max-w-5xl relative'>
        {/* Template Display */}
        <div className='bg-gray-50 rounded-lg p-8 shadow-md border border-gray-200 flex justify-center items-center min-h-96'>
          <div className='w-full scale-100 origin-top'>
            <CurrentTemplate
              {...sampleData}
              mode='template-selection'
              isPreview={true}
            />
          </div>
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={goToPrevious}
          className='absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 md:-translate-x-20 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-2 transition duration-200'
          aria-label='Previous template'
        >
          <ChevronLeft className='w-6 h-6' />
        </button>

        <button
          onClick={goToNext}
          className='absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 md:translate-x-20 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-2 transition duration-200'
          aria-label='Next template'
        >
          <ChevronRight className='w-6 h-6' />
        </button>
      </div>

      {/* Template Info and Dots */}
      <div className='flex flex-col items-center gap-6 w-full'>
        <div className='text-center'>
          {/* <h3 className='text-2xl font-bold text-gray-900 mb-2'>
            {templates[currentIndex].name} Template
          </h3> */}
          <p className='text-[#696969]'>
            Template {currentIndex + 1} of {templates.length}
          </p>
        </div>

        {/* Dot Indicators */}
        <div className='flex gap-2 justify-center'>
          {templates.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition duration-300 ${
                index === currentIndex
                  ? 'bg-orange-500 w-8'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to template ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TemplateDisplay;