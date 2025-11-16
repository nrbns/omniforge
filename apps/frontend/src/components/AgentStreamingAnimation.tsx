'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface AgentStreamingAnimationProps {
  agentName: string;
  status: 'idle' | 'thinking' | 'generating' | 'complete';
  progress?: number;
  message?: string;
}

export function AgentStreamingAnimation({
  agentName,
  status,
  progress = 0,
  message,
}: AgentStreamingAnimationProps) {
  const [streamedText, setStreamedText] = useState('');

  useEffect(() => {
    if (status === 'generating' && message) {
      // Simulate streaming text
      let index = 0;
      const interval = setInterval(() => {
        if (index < message.length) {
          setStreamedText(message.slice(0, index + 1));
          index++;
        } else {
          clearInterval(interval);
        }
      }, 50); // 50ms per character

      return () => clearInterval(interval);
    } else if (status === 'complete') {
      setStreamedText(message || '');
    } else {
      setStreamedText('');
    }
  }, [status, message]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white rounded-lg shadow-lg p-4 mb-4"
    >
      <div className="flex items-center gap-3 mb-2">
        <motion.div
          animate={{
            scale: status === 'thinking' || status === 'generating' ? [1, 1.2, 1] : 1,
          }}
          transition={{
            duration: 1,
            repeat: status === 'thinking' || status === 'generating' ? Infinity : 0,
            ease: 'easeInOut',
          }}
          className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center"
        >
          <span className="text-white text-sm">🤖</span>
        </motion.div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{agentName}</h4>
          <div className="flex items-center gap-2">
            <AnimatePresence mode="wait">
              {status === 'thinking' && (
                <motion.span
                  key="thinking"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-gray-600"
                >
                  Thinking...
                </motion.span>
              )}
              {status === 'generating' && (
                <motion.span
                  key="generating"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-purple-600"
                >
                  Generating...
                </motion.span>
              )}
              {status === 'complete' && (
                <motion.span
                  key="complete"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-green-600"
                >
                  ✓ Complete
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
        {progress > 0 && (
          <div className="text-sm text-gray-500">{Math.round(progress)}%</div>
        )}
      </div>

      {status === 'generating' && (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-1 bg-purple-600 rounded-full mb-2"
        />
      )}

      {streamedText && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 p-3 bg-gray-50 rounded text-sm font-mono text-gray-800 max-h-32 overflow-y-auto"
        >
          <AnimatePresence>
            {streamedText.split('').map((char, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.01 }}
              >
                {char}
              </motion.span>
            ))}
          </AnimatePresence>
          {status === 'generating' && (
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="inline-block w-2 h-4 bg-purple-600 ml-1"
            />
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

/**
 * Agent Swarm Animation
 * Shows multiple agents working in parallel
 */
export function AgentSwarm({ agents }: { agents: Array<{ name: string; status: string; progress?: number }> }) {
  return (
    <div className="space-y-2">
      <AnimatePresence>
        {agents.map((agent, index) => (
          <motion.div
            key={agent.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: index * 0.1 }}
          >
            <AgentStreamingAnimation
              agentName={agent.name}
              status={agent.status as any}
              progress={agent.progress}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

