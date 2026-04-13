import React, { useState } from "react";

const slides = [
  {
    id: 1,
    text: "Reflections begin with an intention. A devotion.",
  },
  {
    id: 2,
    text: "Space to breathe, room to grow. QConnect prioritizes reflection.",
  },
  {
    id: 3,
    text: "Sacred Journaling — distraction-free writing tied to verses.",
  },
];

const Carousel: React.FC = () => {
  const [current, setCurrent] = useState(0);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-gray-100 rounded-lg p-6 shadow-md">
      <p className="text-center text-gray-700 mb-4">{slides[current].text}</p>
      <div className="flex justify-between">
        <button
          onClick={prevSlide}
          className="px-4 py-2 bg-primary text-white rounded-md"
        >
          Prev
        </button>
        <button
          onClick={nextSlide}
          className="px-4 py-2 bg-primary text-white rounded-md"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Carousel;
