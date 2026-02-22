'use client';

import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const RealtimeBuilder = dynamic(
  () => import('../../components/RealtimeBuilder'),
  { ssr: false, loading: () => <div className="min-h-screen flex items-center justify-center">Loading builder...</div> }
);

function RealtimeBuilderContent() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get('roomId') || 'default-room';
  const userId = searchParams.get('userId') || 'demo-user';
  const ideaId = searchParams.get('ideaId') || undefined;
  const projectId = searchParams.get('projectId') || undefined;
  const userName = searchParams.get('userName') || undefined;
  const userColor = searchParams.get('userColor') || undefined;

  return (
    <RealtimeBuilder
      roomId={roomId}
      userId={userId}
      ideaId={ideaId}
      projectId={projectId}
      userName={userName}
      userColor={userColor}
    />
  );
}

export default function RealtimeBuilderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <RealtimeBuilderContent />
    </Suspense>
  );
}

