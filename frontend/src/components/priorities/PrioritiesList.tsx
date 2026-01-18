import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectPriorities, removePriority, updatePriorities } from '../../store/slices/prioritiesSlice';
import { PriorityItem } from './PriorityItem';

export const PrioritiesList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, generating, aiError } = useAppSelector(selectPriorities);

  const handleDelete = (id: string) => {
    dispatch(removePriority(id));
    // Auto-save after deletion
    const updatedItems = items.filter(item => item.id !== id);
    dispatch(updatePriorities(updatedItems));
  };

  if (generating) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">AI가 맞춤형 제안을 생성 중입니다...</p>
        <p className="text-sm text-gray-500 mt-2">10초 이내 완료됩니다</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-600">아직 우선순위가 없습니다.</p>
        <p className="text-sm text-gray-500 mt-2">AI가 제안을 생성하거나 직접 추가해주세요.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {aiError && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-900 font-medium">{aiError}</p>
          <p className="text-sm text-yellow-700 mt-2">
            온보딩 정보를 더 구체적으로 입력하면 더 좋은 제안을 받을 수 있어요!
          </p>
        </div>
      )}

      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {items.length === 3 ? '오늘의 추천 우선순위' : '우선순위'}
      </h3>

      {items.map((priority, index) => (
        <PriorityItem
          key={priority.id}
          priority={priority}
          index={index}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
};
