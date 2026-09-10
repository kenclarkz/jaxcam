import type { ImgHTMLAttributes } from 'react'
import CameraGlyph from './CameraGlyph'

interface Props extends ImgHTMLAttributes<HTMLImageElement> {
  alt: string
}

export default function CameraThumbnail({ alt, ...props }: Props) {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-slate-800/70">
      <CameraGlyph size={26} className="animate-pulse text-slate-600" />
      <img
        {...props}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={`absolute inset-0 h-full w-full object-cover ${props.className ?? ''}`}
        onError={(event) => {
          event.currentTarget.style.display = 'none'
          props.onError?.(event)
        }}
      />
    </div>
  )
}