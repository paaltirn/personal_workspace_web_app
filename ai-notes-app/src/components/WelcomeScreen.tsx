'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Typewriter from './Typewriter';

interface WelcomeScreenProps {
  onComplete: () => void;
}

export default function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showContent, setShowContent] = useState(false);

  const welcomeTexts = [
    '欢迎使用个人工作台',
    '让 AI 助力您的创作之旅',
    '开始记录您的想法吧'
  ];

  useEffect(() => {
    // 延迟显示内容，创造更好的视觉效果
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const handleTypewriterComplete = () => {
    if (currentStep < welcomeTexts.length - 1) {
      // 等待一段时间后显示下一个文本
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 800);
    } else {
      // 所有文本显示完毕，等待一段时间后完成欢迎屏幕
      setTimeout(() => {
        onComplete();
      }, 1500);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background"
      >
        <div className="text-center space-y-8">
          {/* Logo 或图标区域 */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </motion.div>

          {/* 打字机文本区域 */}
          <div className="min-h-[120px] flex flex-col justify-center">
            {showContent && (
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-3xl font-bold text-foreground mb-4"
              >
                <Typewriter
                  text={welcomeTexts[currentStep]}
                  delay={80}
                  cursor={true}
                  onComplete={handleTypewriterComplete}
                />
              </motion.div>
            )}
          </div>

          {/* 加载指示器 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 1 }}
            className="flex justify-center"
          >
            <div className="flex space-x-2">
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index <= currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                  animate={{
                    scale: index === currentStep ? [1, 1.2, 1] : 1,
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: index === currentStep ? Infinity : 0,
                    repeatType: 'reverse',
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}