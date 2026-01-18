export const ProgressBar = ({ currentStep }: { currentStep: 1 | 2 | 3 }) => {
  const progress = (currentStep / 3) * 100;
  return (
    <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
      <div
        className="bg-indigo-600 h-2 rounded-full transition-all duration-300 ease-in-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};
