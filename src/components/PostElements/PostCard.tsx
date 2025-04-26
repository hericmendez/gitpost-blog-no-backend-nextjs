

import React from 'react'
import { cn } from '@/lib/utils'

interface PostCardProps {
  title: string
  date: string
  description?: string
  slug: string
  className?: string
}

export default function PostCard({
  title,
  date,
  description,
  slug,
  className
}: PostCardProps) {
  const formattedDate = new Date(date).toLocaleDateString()

  return (
    <div
      className={cn(
        'rounded-xl shadow-md p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700',
        className
      )}
    >
      <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-100">{title}</h2>
      <p className="text-sm text-neutral-500">{formattedDate}</p>
      {description && (
        <p className="mt-2 text-neutral-600 dark:text-neutral-300">{description}</p>
      )}
      <p className="mt-4 text-xs text-neutral-400 break-words">Slug: {slug}</p>
    </div>
  )
}
