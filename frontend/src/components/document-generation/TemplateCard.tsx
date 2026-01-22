/**
 * Template Card Component - WCAG 2.1 Level AA Compliant
 * Displays a document template with selection action
 */

import { DocumentTemplate } from '../../../../shared/types/documentGeneration.types';

interface TemplateCardProps {
  template: DocumentTemplate;
  onSelect: (template: DocumentTemplate) => void;
}

const TemplateCard = ({ template, onSelect }: TemplateCardProps) => {
  const getCategoryLabel = (category: string) => {
    return category === 'gov_support' ? '정부 지원 사업' : 'IR 자료';
  };

  const getCategoryColor = (category: string) => {
    return category === 'gov_support'
      ? 'bg-blue-100 text-blue-700'
      : 'bg-purple-100 text-purple-700';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(template);
    }
  };

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 group focus-within:ring-2 focus-within:ring-blue-500"
      role="button"
      tabIndex={0}
      onClick={() => onSelect(template)}
      onKeyDown={handleKeyDown}
      aria-label={`${template.template_name} 템플릿 선택하기. ${getCategoryLabel(template.category)}. ${template.questions_min}-${template.questions_max}개 질문`}
    >
      {/* Card Header */}
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {template.template_name}
          </h3>
          <span
            className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium flex-shrink-0 ${getCategoryColor(
              template.category
            )}`}
            aria-label={`카테고리: ${getCategoryLabel(template.category)}`}
          >
            {getCategoryLabel(template.category)}
          </span>
        </div>

        {/* Description */}
        <p className="text-slate-600 dark:text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-3">
          {template.description}
        </p>

        {/* Info */}
        <div className="flex items-center text-[10px] sm:text-xs text-slate-500 dark:text-gray-500 mb-3 sm:mb-4">
          <span aria-label={`질문 개수: ${template.questions_min}개에서 ${template.questions_max}개 사이`}>
            {template.questions_min}-{template.questions_max}개 질문
          </span>
        </div>

        {/* Select Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(template);
          }}
          className="w-full bg-blue-600 text-white py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg text-sm sm:text-base font-medium hover:bg-blue-700 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          aria-label={`${template.template_name} 템플릿으로 문서 생성 시작`}
        >
          문서 생성 시작
        </button>
      </div>
    </div>
  );
};

export default TemplateCard;
