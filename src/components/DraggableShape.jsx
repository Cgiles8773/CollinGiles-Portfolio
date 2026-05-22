import { useRef } from 'react'
import { useSpringPhysics } from '../hooks/useSpringPhysics'

export default function DraggableShape({ children, tagName = 'div', isGameMode, ...props }) {
  const elRef = useRef(null)
  const { onPointerDown } = useSpringPhysics(elRef, isGameMode)
  const Tag = tagName
  return (
    <Tag
      ref={elRef}
      {...props}
      data-wobble=""
      onPointerDown={isGameMode ? onPointerDown : undefined}
      data-draggable={isGameMode ? '' : undefined}
    >
      {children}
    </Tag>
  )
}
