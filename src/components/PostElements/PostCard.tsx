import React from 'react'
import { cn } from '@/lib/utils'
import { Eye, PencilLine, Trash2 } from 'lucide-react'
import Link from "next/link";
import { deletePost, getPosts, PostSummary } from '@/features/posts/postService';
import useSWR from 'swr'

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
  const { mutate } = useSWR<PostSummary[]>("/api/posts", () =>
    getPosts()
  );
  return (
    <div
      className={cn(
        'rounded-xl shadow-md p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700',
        className
      )}
    >
      <div className='flex flex-row justify-between w-full'>
        {' '}
        <h2 className='text-xl font-bold text-neutral-800 dark:text-neutral-100'>
          {title}
        </h2>{' '}<div className='flex flex-row justify-center align-baseline gap-2'  >
          <Link href={`/posts/${slug}`}>
            <button className=" text-slate-500  hover:text-slate-300">
              <Eye />
            </button>
          </Link>
          <Link href={`/editor/${slug}`}>
            <button className=" text-slate-500  hover:text-slate-300">
              <PencilLine />
            </button>
          </Link>
          <Link href={'#'}>
            <button
              onClick={async () => {
                if (!confirm("Confirma delete deste post?")) return;
                await deletePost(slug);
                mutate();
              }}
              className="pb-5 text-red-900  hover:text-red-400 text-sm"
            >
              <Trash2 />
            </button>
          </Link>

        </div>

      </div>

      <p className='text-sm text-neutral-500'>{formattedDate}</p>
      {description && (
        <p className='mt-2 text-neutral-600 dark:text-neutral-300'>
          {description}
        </p>
      )}
      <p className='mt-4 text-xs text-neutral-400 break-words'>Slug: {slug}</p>
    </div>
  )
}
