import Card from '../ui/Card';

export default function AIgeneratingSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-6 p-8">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex gap-2">
              <div className="h-3 w-3 animate-bounce rounded-full bg-primary" style={{ animationDelay: '0s' }} />
              <div className="h-3 w-3 animate-bounce rounded-full bg-primary" style={{ animationDelay: '0.2s' }} />
              <div className="h-3 w-3 animate-bounce rounded-full bg-primary" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
          <h2 className="text-xl font-semibold">AI가 분석 중입니다...</h2>
          <p className="mt-2 text-muted-foreground">
            온보딩 답변을 바탕으로 맞춤형 우선순위를 생성하는 중입니다.
          </p>
        </div>

        {/* Skeleton Cards */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-lg border border-muted bg-muted/30 p-6">
              <div className="flex items-start gap-4">
                <div className="h-5 w-5 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-3/4 rounded bg-muted" />
                  <div className="h-4 w-full rounded bg-muted" />
                  <div className="h-4 w-1/2 rounded bg-muted" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center text-sm text-muted-foreground">
          이 과정은 최대 10초 정도 소요될 수 있습니다.
        </div>
      </CardContent>
    </Card>
  );
}

function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className || 'p-6 pt-0'}>{children}</div>;
}
