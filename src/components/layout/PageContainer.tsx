import React from 'react'

interface PageContainerProps {
  children: React.ReactNode
}

const PageContainer: React.FC<PageContainerProps> = ({ children }) => {
  return <div className="mx-auto max-w-7xl px-8 py-8">{children}</div>
}

export default PageContainer
