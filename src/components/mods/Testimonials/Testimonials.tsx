'use client';

import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { motion, TargetAndTransition } from 'framer-motion';
import { CommunityFeedback } from '@/types/main-content';

const variants = {
  hidden: {
    opacity: 0,
    y: 20
  },
  visible: (i: number): TargetAndTransition => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.5,
      ease: [0.42, 0, 0.58, 1]
    }
  })
};

interface TestimonialsProps {
  title?: string;
  testimonials?: string; // JSON string of testimonials array
}

export default function Testimonials({
  title = "",
  testimonials
}: TestimonialsProps) {
  const [feedbacks, setFeedbacks] = useState<CommunityFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFeedbacks = async () => {
      try {
        // Try to parse custom testimonials from props first
        if (testimonials) {
          try {
            const parsedTestimonials = JSON.parse(testimonials);
            if (Array.isArray(parsedTestimonials) && parsedTestimonials.length > 0) {
              setFeedbacks(parsedTestimonials);
              setIsLoading(false);
              return;
            }
          } catch (parseError) {
            console.error('Failed to parse testimonials:', parseError);
          }
        }

        // Fallback: load from API
        const response = await fetch('/api/main-content');
        if (response.ok) {
          const data = await response.json();
          if (data.communityFeedbacks && data.communityFeedbacks.length > 0) {
            setFeedbacks(data.communityFeedbacks);
          }
        }
      } catch (error) {
        console.error('Failed to load feedbacks:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadFeedbacks();
  }, [testimonials]);

  if (isLoading || feedbacks.length === 0) {
    return null;
  }

  return (
    <section className="max-w-6xl mx-auto px-6 py-12">
      {title && (
        <h2 className="text-3xl font-bold text-center mb-10 text-base-content">
          {title}
        </h2>
      )}

      <div className="grid gap-8 md:grid-cols-3">
        {feedbacks.map((feedback, index) => (
          <motion.div
            key={feedback.id}
            className="card bg-base-200 shadow-xl"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            custom={index}
            variants={variants}
          >
            <div className="card-body">
              <div className="flex items-center gap-4 mb-4">
                <div className="avatar">
                  <div className="w-12 rounded-full">
                    <Image
                      src={feedback.avatar}
                      alt={feedback.name}
                      width={48}
                      height={48}
                    />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-base-content">{feedback.name}</h3>
                  <p className="text-sm text-base-content/60">{feedback.role}</p>
                </div>
              </div>

              <p className="text-base-content/80 italic">
                &ldquo;{feedback.comment}&rdquo;
              </p>

              <p className="text-sm text-base-content/50 mt-4">{feedback.date}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
