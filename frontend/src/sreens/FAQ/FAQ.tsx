import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronDown, FiChevronUp, FiArrowLeft } from 'react-icons/fi';
import './FAQ.scss';

const FAQ = () => {
  const [openSections, setOpenSections] = useState<number[]>([]);

  const faqData = [
    { question: 'Раздел 1', answer: 'Тут будет информация раздела 1' },
    { question: 'Раздел 2', answer: 'Тут будет информация раздела 2' },
    { question: 'Раздел 3', answer: 'Тут будет информация раздела 3' },
    { question: 'Раздел 4', answer: 'Тут будет информация раздела 4' },
    { question: 'Раздел 5', answer: 'Тут будет информация раздела 5' },
    { question: 'Раздел 6', answer: 'Тут будет информация раздела 6' },
  ];

  const toggleSection = (index: number) => {
    setOpenSections(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index) 
        : [...prev, index]
    );
  };

  return (
    <div className="faq-container">
      <Link to="/profile" className="back-button">
        <div className="back-button-wrapper">
          <FiArrowLeft size={24} />
        </div>
      </Link>

      <h1 className="faq-title">Часто задаваемые вопросы</h1>
      
      <div className="faq-list">
        {faqData.map((item, index) => (
          <div key={index} className="faq-item">
            <button 
              className="faq-header"
              onClick={() => toggleSection(index)}
            >
              <span className="faq-question">{item.question}</span>
              {openSections.includes(index) ? <FiChevronUp /> : <FiChevronDown />}
            </button>
            
            {openSections.includes(index) && (
              <div className="faq-content">
                <p className="faq-answer">{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;