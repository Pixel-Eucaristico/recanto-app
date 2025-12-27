'use client'

import Link from 'next/link'
import React from 'react'

type SmartLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string
  children: React.ReactNode
}

const SmartLink = ({ href, children, ...props }: SmartLinkProps) => {
  const isInternal = href.startsWith('/')

  if (isInternal) {
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
    )
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  )
}

export default SmartLink
