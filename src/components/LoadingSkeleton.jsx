// src/components/LoadingSkeleton.jsx
import { motion } from 'framer-motion'

export const DashboardSkeleton = () => (
  <div className="space-y-6">
    {/* Quote skeleton */}
    <div className="h-20 bg-[#18181b] rounded-2xl animate-pulse" />
    
    {/* Chart skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 h-[300px] bg-[#18181b] rounded-[2rem] animate-pulse" />
      <div className="h-[300px] bg-[#18181b] rounded-[2rem] animate-pulse" />
    </div>
    
    {/* Stats skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1,2,3,4].map(i => (
        <div key={i} className="h-44 bg-[#18181b] rounded-[2rem] animate-pulse" />
      ))}
    </div>
  </div>
)

export const ExerciseSkeleton = () => (
  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
    {[1,2,3,4,5,6].map(i => (
      <div key={i} className="bg-[#0a0a0a] rounded-[2.5rem] overflow-hidden">
        <div className="aspect-[16/9] bg-zinc-800 animate-pulse" />
        <div className="p-8 space-y-4">
          <div className="h-8 bg-zinc-800 rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-zinc-800 rounded w-1/2 animate-pulse" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-16 bg-zinc-800 rounded-2xl animate-pulse" />
            <div className="h-16 bg-zinc-800 rounded-2xl animate-pulse" />
          </div>
          <div className="h-12 bg-zinc-800 rounded-2xl animate-pulse" />
        </div>
      </div>
    ))}
  </div>
)

export const WorkoutSkeleton = () => (
  <div className="space-y-6">
    {[1,2,3].map(i => (
      <div key={i} className="bg-slate-800/50 rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-slate-700 rounded-xl animate-pulse" />
          <div className="h-8 w-48 bg-slate-700 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(j => (
            <div key={j} className="h-24 bg-slate-700 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    ))}
  </div>
)

export const DietSkeleton = () => (
  <div className="grid lg:grid-cols-3 gap-8">
    <div className="lg:col-span-2 space-y-4">
      {[1,2,3].map(i => (
        <div key={i} className="h-32 bg-slate-800/50 rounded-xl animate-pulse" />
      ))}
    </div>
    <div className="space-y-4">
      {[1,2,3].map(i => (
        <div key={i} className="h-40 bg-slate-800/50 rounded-xl animate-pulse" />
      ))}
    </div>
  </div>
)