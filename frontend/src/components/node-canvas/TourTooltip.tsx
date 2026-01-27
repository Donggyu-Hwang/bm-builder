/**
 * Tour Tooltip Component
 * Displays guided tour tooltips with spotlight effect
 */

import { useEffect, useRef, useState } from 'react';
import { useTour } from './TourProvider';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export const TourTooltip = () => {
  const { isTourActive, currentStep, steps, nextStep, skipTour, endTour, goToStep } = useTour();

  const tooltipRef = useRef<HTMLDivElement>(null);
  const [spotlightStyle, setSpotlightStyle] = useState<React.CSSProperties>({});

  if (!isTourActive) return null;

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  // Calculate and update spotlight position
  useEffect(() => {
    const updateSpotlight = () => {
      const targetElement = document.querySelector(step.target);
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        setSpotlightStyle({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
          opacity: 1,
        });
      }
    };

    updateSpotlight();

    // Update on scroll/resize
    const handleScroll = () => updateSpotlight();
    const handleResize = () => updateSpotlight();

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [step.target]);

  // Scroll target into view
  useEffect(() => {
    const targetElement = document.querySelector(step.target);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [step.target]);

  const handleNext = () => {
    if (isLastStep) {
      endTour();
    } else {
      nextStep();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    skipTour();
  };

  return (
    <>
      {/* Dark overlay */}
      <div className="tour-overlay" />

      {/* Spotlight on target */}
      <div
        className="tour-spotlight active"
        style={{
          ...spotlightStyle,
        }}
      />

      {/* Tooltip */}
      <div className="tour-tooltip" data-position={step.position}>
        <div className="tour-tooltip-content" ref={tooltipRef}>
          {/* Header */}
          <div className="tour-tooltip-header">
            <div className="tour-step-indicator">
              {currentStep + 1} / {steps.length}
            </div>
            <h3 className="tour-tooltip-title">{step.title}</h3>
            <button onClick={handleSkip} className="tour-tooltip-close" aria-label="닫기">
              <X size={18} />
            </button>
          </div>

          {/* Content */}
          <div className="tour-tooltip-body">
            <p className="tour-tooltip-text">{step.content}</p>
          </div>

          {/* Footer */}
          <div className="tour-tooltip-footer">
            {!isFirstStep && (
              <button
                onClick={handlePrevious}
                className="tour-tooltip-button tour-tooltip-button-secondary"
              >
                <ChevronLeft size={16} />
                이전
              </button>
            )}

            <button onClick={handleSkip} className="tour-tooltip-button tour-tooltip-button-ghost">
              건너뛰기
            </button>

            <button
              onClick={handleNext}
              className="tour-tooltip-button tour-tooltip-button-primary"
            >
              {isLastStep ? (
                <>
                  완료
                  <ChevronRight size={16} />
                </>
              ) : (
                <>
                  다음
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </div>

          {/* Progress bar */}
          <div className="tour-tooltip-progress">
            <div
              className="tour-tooltip-progress-bar"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </>
  );
};
